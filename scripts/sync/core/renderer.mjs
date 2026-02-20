import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';

// Import only common languages for code highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml'; // covers HTML
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import yaml from 'highlight.js/lib/languages/yaml';
import diff from 'highlight.js/lib/languages/diff';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('diff', diff);

// ---------------------------------------------------------------------------
// WeChat inline styles map — every tag must carry its own styles because
// WeChat's rich-text editor strips <style> blocks and class attributes.
//
// Design reference: doocs/md default theme (OpenWrite style)
// Key: letter-spacing for readability, generous margins, themed headings
// ---------------------------------------------------------------------------
const WECHAT_PRIMARY = '#07C160';

const WECHAT_STYLES = {
  h1: `display:table;font-size:1.2em;font-weight:bold;color:#333;margin:2em auto 1em;padding:0 1em;border-bottom:2px solid ${WECHAT_PRIMARY};text-align:center;`,
  h2: `display:table;font-size:1.2em;font-weight:bold;color:#fff;margin:4em auto 2em;padding:4px 1em;background:${WECHAT_PRIMARY};text-align:center;`,
  h3: `font-size:1.1em;font-weight:bold;color:#333;margin:2em 8px 0.75em 0;padding-left:8px;border-left:3px solid ${WECHAT_PRIMARY};line-height:1.2;`,
  p: 'font-size:15px;line-height:1.75;color:#333;margin:1.5em 8px;letter-spacing:0.1em;',
  blockquote:
    `border-left:4px solid ${WECHAT_PRIMARY};padding:1em;border-radius:6px;background:#f8f8f8;margin:1em 8px;color:#666;`,
  pre: 'background:#282c34;padding:0;border-radius:8px;overflow-x:auto;margin:10px 8px;',
  code_inline:
    'background:rgba(27,31,35,0.05);padding:3px 5px;border-radius:4px;color:#d14;font-size:90%;font-family:Menlo,Monaco,Consolas,monospace;',
  code_block:
    'display:block;font-family:Menlo,Monaco,Consolas,monospace;font-size:90%;color:#abb2bf;line-height:1.5;padding:0.5em 1em 1em;overflow-x:auto;',
  img: 'display:block;max-width:100%;border-radius:4px;margin:0.1em auto 0.5em;',
  a: 'color:#576b95;text-decoration:none;',
  li: 'display:block;font-size:15px;line-height:1.75;color:#333;margin:0.2em 8px;letter-spacing:0.1em;',
  ul: 'list-style:circle;padding-left:1em;margin-left:0;',
  ol: 'padding-left:1em;margin-left:0;',
  table:
    'border-collapse:collapse;width:100%;margin:1em 8px;font-size:15px;',
  th: `border:1px solid #dfdfdf;padding:0.25em 0.5em;background:rgba(0,0,0,0.05);font-weight:bold;text-align:left;word-break:keep-all;`,
  td: 'border:1px solid #dfdfdf;padding:0.25em 0.5em;word-break:keep-all;',
  hr: 'border:none;border-top:2px solid rgba(0,0,0,0.1);margin:1.5em 0;height:0;',
  strong: `font-weight:bold;color:${WECHAT_PRIMARY};`,
  em: 'font-style:italic;',
  figcaption: 'text-align:center;color:#888;font-size:0.8em;',
};

// ---------------------------------------------------------------------------
// Tip container markers used during pre/post-processing
// ---------------------------------------------------------------------------
const TIP_START = '<!--TIP_START-->';
const TIP_END = '<!--TIP_END-->';

// ---------------------------------------------------------------------------
// Pre-process: convert VuePress :::tip containers into comment markers so
// that marked can process the inner content as normal markdown.
// ---------------------------------------------------------------------------
function preprocessTipContainers(md) {
  // Match :::tip (with optional title) ... ::: blocks across multiple lines
  return md.replace(
    /^:::tip[^\n]*\n([\s\S]*?)^:::/gm,
    `${TIP_START}\n$1${TIP_END}`,
  );
}

// ---------------------------------------------------------------------------
// Post-process: replace comment markers with platform-specific tip markup.
// ---------------------------------------------------------------------------
function postprocessTipContainers(html, format) {
  const tipRegex = new RegExp(
    `${TIP_START}([\\s\\S]*?)${TIP_END}`,
    'g',
  );

  return html.replace(tipRegex, (_match, inner) => {
    // The inner content has already been rendered by marked.
    switch (format) {
      case 'wechat-html':
        return `<section style="border-left:4px solid ${WECHAT_PRIMARY};padding:1em;border-radius:6px;background:#f8f8f8;margin:1em 8px;">${inner}</section>`;
      case 'bilibili-html':
        return `<blockquote>${inner}</blockquote>`;
      case 'html':
      default:
        return `<blockquote style="border-left:4px solid #42b983;padding:10px 15px;background:#f8f8f8;">${inner}</blockquote>`;
    }
  });
}

// ---------------------------------------------------------------------------
// Highlight a code string. Falls back to plain text if the language is
// unknown or auto-detection fails.
// ---------------------------------------------------------------------------
function highlightCode(code, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang }).value;
    } catch {
      // fall through
    }
  }

  // Auto-detect
  try {
    return hljs.highlightAuto(code).value;
  } catch {
    return code;
  }
}

// ---------------------------------------------------------------------------
// Build a custom marked renderer for the given format.
// ---------------------------------------------------------------------------
function createRenderer(format) {
  const renderer = new marked.Renderer();

  // ---- Code blocks --------------------------------------------------------
  renderer.code = function ({ text, lang }) {
    const highlighted = highlightCode(text, lang);

    if (format === 'wechat-html') {
      return `<pre style="${WECHAT_STYLES.pre}"><code style="${WECHAT_STYLES.code_block}">${highlighted}</code></pre>`;
    }

    // html / bilibili-html — use class for highlight.js theme if desired
    return `<pre><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre>`;
  };

  // ---- Inline code --------------------------------------------------------
  renderer.codespan = function ({ text }) {
    if (format === 'wechat-html') {
      return `<code style="${WECHAT_STYLES.code_inline}">${text}</code>`;
    }
    return `<code>${text}</code>`;
  };

  // ---- Images — platform-specific wrappers --------------------------------
  renderer.image = function ({ href, title, text }) {
    const alt = text || '';
    const titleAttr = title ? ` title="${title}"` : '';

    switch (format) {
      case 'wechat-html':
        // No figure wrapper — WeChat doesn't handle it well
        return `<img style="${WECHAT_STYLES.img}" src="${href}" alt="${alt}"${titleAttr}/>`;

      case 'bilibili-html':
        return (
          `<figure class="img-box">` +
          `<img src="${href}" alt="${alt}"${titleAttr}/>` +
          `<figcaption class="caption">${alt}</figcaption>` +
          `</figure>`
        );

      case 'html':
      default: {
        // Zhihu requires data-caption on <img> for its caption display area
        const captionAttr = alt ? ` data-caption="${alt}"` : '';
        return (
          `<figure>` +
          `<img src="${href}" alt="${alt}"${captionAttr}${titleAttr}/>` +
          `</figure>`
        );
      }
    }
  };

  return renderer;
}

// ---------------------------------------------------------------------------
// Inject WeChat inline styles into every matching HTML tag via regex.
// This runs as a post-processing step after marked has generated the HTML.
// ---------------------------------------------------------------------------
function injectWechatStyles(html) {
  // For tags that have already been styled by the custom renderer (code, pre,
  // img), we skip them by only matching tags WITHOUT an existing style attr.

  const tagStyleMap = {
    h1: WECHAT_STYLES.h1,
    h2: WECHAT_STYLES.h2,
    h3: WECHAT_STYLES.h3,
    p: WECHAT_STYLES.p,
    blockquote: WECHAT_STYLES.blockquote,
    a: WECHAT_STYLES.a,
    li: WECHAT_STYLES.li,
    ul: WECHAT_STYLES.ul,
    ol: WECHAT_STYLES.ol,
    table: WECHAT_STYLES.table,
    th: WECHAT_STYLES.th,
    td: WECHAT_STYLES.td,
    hr: WECHAT_STYLES.hr,
    strong: WECHAT_STYLES.strong,
    em: WECHAT_STYLES.em,
    figcaption: WECHAT_STYLES.figcaption,
  };

  let result = html;

  for (const [tag, style] of Object.entries(tagStyleMap)) {
    // Match opening tags that do NOT already have a style attribute.
    // Handles self-closing (<hr/>) and normal (<p>) tags.
    const re = new RegExp(`<${tag}(\\s[^>]*?)?>`, 'gi');

    result = result.replace(re, (match) => {
      // Skip if style is already present (e.g. set by renderer or tip post-processor)
      if (/style\s*=/.test(match)) {
        return match;
      }
      // Insert style right after the tag name
      return match.replace(
        new RegExp(`<${tag}`, 'i'),
        `<${tag} style="${style}"`,
      );
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Convert <ol> / <ul> to manually styled <p> elements for platforms that
// don't correctly render list numbering or add extra blank lines.
// ---------------------------------------------------------------------------
function convertListsToParagraphs(html, format) {
  let result = html;

  const pStyle = format === 'wechat-html' ? ` style="${WECHAT_STYLES.p}"` : '';

  // Convert <ol> to numbered <p> elements
  result = result.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (_match, inner) => {
    let counter = 0;
    return inner.replace(/<li([^>]*)>([\s\S]*?)<\/li>/g, (_m, _attrs, content) => {
      counter++;
      return `<p${pStyle}>${counter}. ${content}</p>`;
    });
  });

  // Convert <ul> to bullet <p> elements
  result = result.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (_match, inner) => {
    return inner.replace(/<li([^>]*)>([\s\S]*?)<\/li>/g, (_m, _attrs, content) => {
      return `<p${pStyle}>• ${content}</p>`;
    });
  });

  return result;
}

// ---------------------------------------------------------------------------
// Clean up list HTML for platform compatibility.
// 1. Remove whitespace/newlines between list tags (prevents blank lines).
// 2. Remove <p> wrappers inside <li> (loose lists -> tight rendering).
// ---------------------------------------------------------------------------
function cleanListHtml(html) {
  let result = html;

  // Remove newlines between list-related tags:
  // </li>\n<li>, <ul>\n<li>, </li>\n</ul>, <ol>\n<li>, </li>\n</ol>
  result = result.replace(/<\/li>\s*<li/g, '</li><li');
  result = result.replace(/<ul([^>]*)>\s*<li/g, '<ul$1><li');
  result = result.replace(/<ol([^>]*)>\s*<li/g, '<ol$1><li');
  result = result.replace(/<\/li>\s*<\/ul>/g, '</li></ul>');
  result = result.replace(/<\/li>\s*<\/ol>/g, '</li></ol>');

  // Unwrap <p> tags inside <li> (from loose/spaced markdown lists)
  result = result.replace(/<li([^>]*)><p([^>]*)>([\s\S]*?)<\/p>\s*<\/li>/g, '<li$1>$3</li>');

  return result;
}

// ---------------------------------------------------------------------------
// Convert <table> to text-based layout for platforms (like Zhihu) that strip
// or fail to render HTML tables.
// Each row becomes: "| col1 | col2 | col3 |" wrapped in a styled <p>.
// A separator line "| --- | --- | --- |" is inserted after the header row.
// ---------------------------------------------------------------------------
function convertTableToText(html, format) {
  const pStyle = format === 'wechat-html' ? ` style="${WECHAT_STYLES.p}"` : '';

  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (_match, tableInner) => {
    const rows = [];

    // Extract thead rows
    const theadMatch = tableInner.match(/<thead>([\s\S]*?)<\/thead>/);
    if (theadMatch) {
      const headerCells = [];
      const thRe = /<th[^>]*>([\s\S]*?)<\/th>/g;
      let thMatch;
      while ((thMatch = thRe.exec(theadMatch[1])) !== null) {
        headerCells.push(thMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (headerCells.length > 0) {
        rows.push(`| ${headerCells.join(' | ')} |`);
        rows.push(`| ${headerCells.map(() => '---').join(' | ')} |`);
      }
    }

    // Extract tbody rows
    const tbodyMatch = tableInner.match(/<tbody>([\s\S]*?)<\/tbody>/) || [null, tableInner];
    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let trMatch;
    const tbodyContent = tbodyMatch[1];
    while ((trMatch = trRe.exec(tbodyContent)) !== null) {
      // Skip if this row is inside <thead> (already processed)
      if (theadMatch && theadMatch[1].includes(trMatch[0])) continue;
      const cells = [];
      const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let tdMatch;
      while ((tdMatch = tdRe.exec(trMatch[1])) !== null) {
        cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length > 0) {
        rows.push(`| ${cells.join(' | ')} |`);
      }
    }

    return rows.map((row) => `<p${pStyle}>${row}</p>`).join('');
  });
}

// ---------------------------------------------------------------------------
// Convert <a> links to footnote-style references for platforms (like WeChat)
// that strip external hyperlinks from article content.
// Inline links become "text[1]" and a reference list is appended at the end.
// ---------------------------------------------------------------------------
function convertLinksToFootnotes(html) {
  const links = [];
  const seen = new Map(); // url -> footnote number

  const result = html.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_match, href, text) => {
    // Skip anchor links and empty hrefs
    if (!href || href.startsWith('#')) return text;

    let num;
    if (seen.has(href)) {
      num = seen.get(href);
    } else {
      num = links.length + 1;
      seen.set(href, num);
      links.push({ num, href });
    }

    // Return text with superscript footnote number
    return `${text}<sup style="color:#576b95;font-size:12px;">[${num}]</sup>`;
  });

  if (links.length === 0) return result;

  // Append footnote reference list
  const footnoteSection = [
    `<section style="margin-top:30px;padding-top:15px;border-top:1px solid #eee;">`,
    `<p style="font-size:14px;font-weight:bold;color:#333;margin-bottom:8px;">References</p>`,
    ...links.map(({ num, href }) =>
      `<p style="font-size:12px;line-height:1.6;color:#999;word-break:break-all;">[${num}] ${href}</p>`
    ),
    `</section>`,
  ].join('');

  return result + footnoteSection;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render clean markdown (frontmatter already stripped) into platform-specific
 * HTML for blog syndication.
 *
 * @param {string}  markdown - The markdown content to render.
 * @param {'html' | 'wechat-html' | 'bilibili-html'} format - Target platform.
 * @returns {string} Rendered HTML string.
 */
export function render(markdown, format = 'html') {
  // 1. Pre-process: convert :::tip containers to comment markers
  const preprocessed = preprocessTipContainers(markdown);

  // 2. Configure marked with our custom renderer and highlight.js
  const renderer = createRenderer(format);

  const html = marked(preprocessed, {
    renderer,
    breaks: false,
    gfm: true,
  });

  // 3. Post-process tip containers into platform-specific markup
  let result = postprocessTipContainers(html, format);

  // 4. For WeChat, inject inline styles on remaining tags
  if (format === 'wechat-html') {
    result = injectWechatStyles(result);
  }

  // 5. Clean up list HTML: remove newlines between list tags to prevent
  //    platforms (especially Zhihu & WeChat) from interpreting them as
  //    visible whitespace or extra blank lines.
  result = cleanListHtml(result);

  // 6. For Zhihu and WeChat, convert lists to manually styled paragraphs
  //    because their editors don't render list numbering correctly and
  //    insert extra blank lines between list items.
  if (format === 'html' || format === 'wechat-html') {
    result = convertListsToParagraphs(result, format);
  }

  // 7. Convert <table> to text-based rows for platforms that strip or
  //    fail to render HTML tables (Zhihu, Bilibili).
  if (format === 'html' || format === 'bilibili-html') {
    result = convertTableToText(result, format);
  }

  // 8. For WeChat, convert hyperlinks to footnote references because
  //    WeChat strips external <a href> links from article content.
  if (format === 'wechat-html') {
    result = convertLinksToFootnotes(result);
  }

  return result;
}
