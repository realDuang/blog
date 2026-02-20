#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { loadConfig, getProjectRoot, saveConfig } from './utils/config.mjs';
import { parseArticle, tipToBlockquote } from './core/parser.mjs';
import { render } from './core/renderer.mjs';
import { processImages } from './core/image-pipeline.mjs';
import { runLogin } from './core/auth.mjs';
import {
  checkEnvironment,
  selectAction,
  selectArticle,
  selectPlatforms,
  confirmSync,
} from './core/interactive.mjs';
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
Usage: pnpm sync [article.md] [options]

  Run without arguments for interactive mode.

Options:
  -p, --platform <names>  Comma-separated platform names (default: from config)
                           Available: ${AVAILABLE_PLATFORMS.join(', ')}
  -l, --login <platform>  Check auth & login via browser (or 'all')
  --preview               Generate local HTML preview without uploading
  -h, --help              Show this help message

Examples:
  pnpm sync                                      # Interactive mode
  pnpm sync blogs/ai/2026-02-20.md               # Sync with interactive platform select
  pnpm sync blogs/ai/2026-02-20.md -p juejin     # Direct sync
  pnpm sync blogs/ai/2026-02-20.md --preview     # Preview
  pnpm sync --login all                          # Login to all platforms
`);
}

function resolvePlatforms(platformArg) {
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
  return AVAILABLE_PLATFORMS;
}

function createAdapter(name, config) {
  const AdapterClass = ADAPTER_MAP[name];
  if (!AdapterClass) {
    throw new Error(`No adapter for platform: ${name}`);
  }
  return new AdapterClass(config);
}

function prepareContent(markdown, platformName) {
  const adapter = ADAPTER_MAP[platformName];
  if (!adapter) return markdown;

  const htmlFormat = HTML_FORMAT_MAP[platformName];

  if (htmlFormat) {
    return render(markdown, htmlFormat);
  } else {
    return tipToBlockquote(markdown);
  }
}

// ---------------------------------------------------------------------------
// Shared sync/preview pipeline
// ---------------------------------------------------------------------------
async function syncArticle(filePath, platforms, config, { isPreview = false, needConfirm = false } = {}) {
  const { meta, markdown, images } = parseArticle(filePath);

  console.log(`\nArticle: "${meta.title}"`);
  console.log(`  Date: ${meta.date}`);
  console.log(`  Categories: ${(meta.categories || []).join(', ')}`);
  console.log(`  Tags: ${(meta.tags || []).join(', ')}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Content: ${markdown.length} chars`);
  console.log(`  Platforms: ${platforms.join(', ')}`);
  console.log();

  if (needConfirm) {
    const confirmed = await confirmSync();
    if (!confirmed) {
      console.log('Cancelled.');
      return;
    }
    console.log();
  }

  for (const platformName of platforms) {
    console.log(`--- ${platformName} ---`);
    const platformConfig = config[platformName];

    if (!platformConfig) {
      console.error(`  No config for "${platformName}" in .sync.config.json. Skipping.`);
      continue;
    }

    // Prepare content (MD or HTML based on platform)
    let content = prepareContent(markdown, platformName);

    // --preview: save formatted content to local file
    if (isPreview) {
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

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
async function main() {
  const { values: opts, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      platform: { type: 'string', short: 'p' },
      login: { type: 'string', short: 'l' },
      preview: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
  });

  if (opts.help) {
    printUsage();
    return;
  }

  const config = loadConfig({ exitIfMissing: !opts.login });

  // --login: check auth & open browser login
  if (opts.login) {
    const updatedConfig = await runLogin(opts.login, config, ADAPTER_MAP);
    saveConfig(updatedConfig);
    console.log('\nCredentials updated in .sync.config.json');
    return;
  }

  // === INTERACTIVE MODE: no file argument, running in TTY ===
  if (positionals.length === 0 && process.stdin.isTTY) {
    console.log('\n=== Blog Sync Tool ===');

    const authStatus = await checkEnvironment(config, ADAPTER_MAP);
    const action = await selectAction();

    if (action === 'login') {
      const updatedConfig = await runLogin('all', config, ADAPTER_MAP);
      saveConfig(updatedConfig);
      console.log('\nCredentials updated in .sync.config.json');
      return;
    }

    const filePath = await selectArticle(getProjectRoot());
    const isPreview = action === 'preview';

    let platforms;
    if (isPreview) {
      // Preview generates output for all platforms by default
      platforms = [...AVAILABLE_PLATFORMS];
    } else {
      platforms = await selectPlatforms(AVAILABLE_PLATFORMS, authStatus);
    }

    await syncArticle(filePath, platforms, config, { isPreview, needConfirm: !isPreview });
    return;
  }

  // === NON-INTERACTIVE MODE ===
  if (positionals.length === 0) {
    console.error('Error: Please provide a markdown file path.');
    printUsage();
    process.exit(1);
  }

  const filePath = resolve(getProjectRoot(), positionals[0]);
  const isPreview = opts.preview;

  // Preview defaults to all platforms; sync uses -p flag or interactive selection
  let finalPlatforms;
  if (isPreview) {
    finalPlatforms = opts.platform ? resolvePlatforms(opts.platform) : [...AVAILABLE_PLATFORMS];
  } else if (opts.platform) {
    finalPlatforms = resolvePlatforms(opts.platform);
  } else if (process.stdin.isTTY) {
    finalPlatforms = await selectPlatforms(AVAILABLE_PLATFORMS);
  } else {
    finalPlatforms = resolvePlatforms(null);
  }

  await syncArticle(filePath, finalPlatforms, config, {
    isPreview,
    needConfirm: !opts.platform && !isPreview && process.stdin.isTTY,
  });
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
