import { readFileSync } from 'node:fs';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?/;
const MORE_RE = /<!--\s*more\s*-->\n?/g;
const CONTAINER_RE = /^:::tip\s*\n([\s\S]*?)\n:::\s*$/gm;
const IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

/**
 * Parse simple YAML frontmatter (supports string and string[] values only)
 */
function parseSimpleYaml(yamlStr) {
  const result = {};
  let currentKey = null;
  for (const line of yamlStr.split('\n')) {
    const keyMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      const trimmed = value.trim();
      if (trimmed) {
        result[key] = trimmed;
      } else {
        result[key] = [];
        currentKey = key;
      }
    } else if (currentKey && line.match(/^\s+-\s+(.*)/)) {
      result[currentKey].push(RegExp.$1.trim());
    }
  }
  return result;
}

/**
 * Parse a VuePress blog markdown file.
 * Returns metadata, clean markdown, and image URLs.
 *
 * @param {string} filePath - Absolute path to the .md file
 * @returns {{ meta: object, markdown: string, images: string[] }}
 */
export function parseArticle(filePath) {
  const raw = readFileSync(filePath, 'utf-8');

  // Extract frontmatter
  let meta = {};
  let body = raw;
  const fmMatch = raw.match(FRONTMATTER_RE);
  if (fmMatch) {
    meta = parseSimpleYaml(fmMatch[1]);
    body = raw.slice(fmMatch[0].length);
  }

  // Strip <!-- more -->
  body = body.replace(MORE_RE, '');

  // Extract image URLs before any transformation
  const images = [];
  let imgMatch;
  const imgRe = new RegExp(IMAGE_RE.source, IMAGE_RE.flags);
  while ((imgMatch = imgRe.exec(body)) !== null) {
    images.push(imgMatch[2]);
  }

  return { meta, markdown: body.trim(), images };
}

/**
 * Convert :::tip blocks to markdown blockquotes for MD-native platforms
 */
export function tipToBlockquote(markdown) {
  return markdown.replace(CONTAINER_RE, (_, inner) => {
    return inner
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  });
}
