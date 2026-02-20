#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { exec } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { loadConfig, getProjectRoot } from './utils/config.mjs';
import { parseArticle, tipToBlockquote } from './core/parser.mjs';
import { render } from './core/renderer.mjs';
import { processImages } from './core/image-pipeline.mjs';
import { JuejinAdapter } from './adapters/juejin.mjs';
import { ZhihuAdapter } from './adapters/zhihu.mjs';
import { WechatAdapter } from './adapters/wechat.mjs';
import { BilibiliAdapter } from './adapters/bilibili.mjs';

const AVAILABLE_PLATFORMS = ['juejin', 'zhihu', 'wechat', 'bilibili'];

const ADAPTER_MAP = {
  juejin: JuejinAdapter,
  zhihu: ZhihuAdapter,
  wechat: WechatAdapter,
  bilibili: BilibiliAdapter,
};

const HTML_FORMAT_MAP = {
  zhihu: 'html',
  wechat: 'wechat-html',
  bilibili: 'bilibili-html',
};

function printUsage() {
  console.log(`
Usage: pnpm sync <article.md> [options]

Options:
  -p, --platform <names>  Comma-separated platform names (default: from config)
                          Available: ${AVAILABLE_PLATFORMS.join(', ')}
  --preview               Generate local HTML preview without uploading
  -c, --clipboard         Copy formatted content to clipboard (first platform only)
  --dry-run               Show what would happen without doing it
  --check-auth            Check authentication status for all platforms
  -h, --help              Show this help message

Examples:
  pnpm sync blogs/ai/2026-02-20.md
  pnpm sync blogs/ai/2026-02-20.md -p juejin,zhihu
  pnpm sync blogs/ai/2026-02-20.md --preview
  pnpm sync blogs/ai/2026-02-20.md -p wechat --clipboard
  pnpm sync --check-auth
`);
}

function resolvePlatforms(platformArg, config) {
  if (platformArg) {
    const names = platformArg.split(/[,\s]+/).filter(Boolean).map((s) => s.toLowerCase());
    for (const name of names) {
      if (!AVAILABLE_PLATFORMS.includes(name)) {
        console.error(`Unknown platform: "${name}". Available: ${AVAILABLE_PLATFORMS.join(', ')}`);
        process.exit(1);
      }
    }
    return names;
  }
  return config.defaultPlatforms || ['juejin'];
}

function createAdapter(name, config) {
  const AdapterClass = ADAPTER_MAP[name];
  if (!AdapterClass) {
    throw new Error(`No adapter for platform: ${name}`);
  }
  return new AdapterClass(config);
}

function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    const proc = exec('clip', (err) => {
      if (err) reject(err);
      else resolve();
    });
    proc.stdin.write(text);
    proc.stdin.end();
  });
}

function prepareContent(markdown, platformName) {
  const adapter = ADAPTER_MAP[platformName];
  if (!adapter) return markdown;

  // Determine content format based on platform
  const htmlFormat = HTML_FORMAT_MAP[platformName];

  if (htmlFormat) {
    // HTML platforms: render markdown to HTML
    return render(markdown, htmlFormat);
  } else {
    // Markdown platforms: just clean up :::tip blocks
    return tipToBlockquote(markdown);
  }
}

async function main() {
  const { values: opts, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      platform: { type: 'string', short: 'p' },
      preview: { type: 'boolean', default: false },
      clipboard: { type: 'boolean', short: 'c', default: false },
      'dry-run': { type: 'boolean', default: false },
      'check-auth': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (opts.help) {
    printUsage();
    return;
  }

  const config = loadConfig();

  // --check-auth: verify all platform cookies
  if (opts['check-auth']) {
    console.log('Checking auth status...\n');
    for (const name of AVAILABLE_PLATFORMS) {
      const platformConfig = config[name];
      if (!platformConfig) {
        console.log(`  [${name}] No config found`);
        continue;
      }
      const hasValues = Object.values(platformConfig).some((v) => v && v.length > 0);
      if (!hasValues) {
        console.log(`  [${name}] Not configured (empty values)`);
        continue;
      }
      try {
        const adapter = createAdapter(name, platformConfig);
        await adapter.checkAuth();
      } catch (err) {
        console.error(`  [${name}] Auth check error: ${err.message}`);
      }
    }
    return;
  }

  if (positionals.length === 0) {
    console.error('Error: Please provide a markdown file path.');
    printUsage();
    process.exit(1);
  }

  const filePath = resolve(getProjectRoot(), positionals[0]);
  const platforms = resolvePlatforms(opts.platform, config);

  // Parse article
  const { meta, markdown, images } = parseArticle(filePath);

  console.log(`Article: "${meta.title}"`);
  console.log(`  Date: ${meta.date}`);
  console.log(`  Categories: ${(meta.categories || []).join(', ')}`);
  console.log(`  Tags: ${(meta.tags || []).join(', ')}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Content: ${markdown.length} chars`);
  console.log(`  Platforms: ${platforms.join(', ')}`);
  console.log();

  for (const platformName of platforms) {
    console.log(`--- ${platformName} ---`);
    const platformConfig = config[platformName];

    if (!platformConfig) {
      console.error(`  No config for "${platformName}" in .sync.config.json. Skipping.`);
      continue;
    }

    // Prepare content (MD or HTML based on platform)
    let content = prepareContent(markdown, platformName);

    if (opts['dry-run']) {
      console.log(`  [dry-run] Would sync "${meta.title}" (${content.length} chars, ${images.length} images)`);
      console.log(`  [dry-run] Content format: ${HTML_FORMAT_MAP[platformName] ? 'HTML' : 'Markdown'}`);
      continue;
    }

    // --preview: save formatted content to local file
    if (opts.preview) {
      const outputDir = resolve(getProjectRoot(), 'scripts/sync/output');
      if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

      const ext = HTML_FORMAT_MAP[platformName] ? 'html' : 'md';
      const outputFile = resolve(outputDir, `${platformName}.${ext}`);

      if (ext === 'html') {
        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title} - ${platformName} preview</title>
  <style>body{max-width:800px;margin:0 auto;padding:20px;font-family:system-ui,-apple-system,sans-serif;}</style>
</head>
<body>
<h1>${meta.title}</h1>
${content}
</body>
</html>`;
        writeFileSync(outputFile, fullHtml, 'utf-8');
      } else {
        writeFileSync(outputFile, `# ${meta.title}\n\n${content}`, 'utf-8');
      }

      console.log(`  Preview saved: ${outputFile}`);
      continue;
    }

    // --clipboard: copy content and stop
    if (opts.clipboard) {
      await copyToClipboard(content);
      console.log(`  Content copied to clipboard (${content.length} chars)`);
      continue;
    }

    // Full sync pipeline
    const adapter = createAdapter(platformName, platformConfig);

    // 1. Check auth
    const authOk = await adapter.checkAuth();
    if (!authOk) {
      continue;
    }

    // 2. Process images (download from COS + upload to platform + replace URLs)
    if (images.length > 0) {
      const contentType = HTML_FORMAT_MAP[platformName] ? 'html' : 'markdown';
      content = await processImages(content, adapter, contentType);
    }

    // 3. Platform-specific final formatting
    content = adapter.formatContent(content, meta);

    // 4. Create draft
    try {
      const draft = await adapter.createDraft(content, meta);
      console.log(`  Draft created!`);
      if (draft.url) console.log(`  URL: ${draft.url}`);
      if (draft.id) console.log(`  ID: ${draft.id}`);
    } catch (err) {
      console.error(`  Draft creation failed: ${err.message}`);
    }

    console.log();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
