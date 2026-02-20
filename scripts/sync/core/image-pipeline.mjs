/**
 * Image processing pipeline:
 * 1. Extract image URLs from content
 * 2. Download images from source (COS)
 * 3. Upload to target platform via adapter
 * 4. Replace URLs in content
 */

const IMAGE_MD_RE = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
const IMAGE_HTML_RE = /<img\s[^>]*src="(https?:\/\/[^"]+)"[^>]*>/g;

/**
 * Process all images in content: download from source, upload to platform, replace URLs.
 *
 * @param {string} content - Markdown or HTML content with original image URLs
 * @param {import('../adapters/base.mjs').PlatformAdapter} adapter - Target platform adapter
 * @param {'markdown' | 'html'} contentType - Whether content is markdown or HTML
 * @returns {Promise<string>} Content with replaced image URLs
 */
export async function processImages(content, adapter, contentType = 'markdown') {
  // Extract image URLs based on content type
  const regex = contentType === 'markdown' ? IMAGE_MD_RE : IMAGE_HTML_RE;
  const urlSet = new Set();
  let match;

  const re = new RegExp(regex.source, regex.flags);
  while ((match = re.exec(content)) !== null) {
    const url = contentType === 'markdown' ? match[2] : match[1];
    urlSet.add(url);
  }

  const urls = [...urlSet];
  if (urls.length === 0) return content;

  console.log(`  Found ${urls.length} image(s) to process`);

  // Download all images in parallel from source
  const downloads = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`  Failed to download: ${url} (${res.status})`);
          return null;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const filename = decodeURIComponent(url.split('/').pop().split('?')[0]);
        const mimeType = res.headers.get('content-type') || 'image/png';
        return { url, buffer, filename, mimeType };
      } catch (err) {
        console.error(`  Download error for ${url}: ${err.message}`);
        return null;
      }
    }),
  );

  // Upload to target platform sequentially (rate-limit friendly)
  let result = content;
  for (const img of downloads) {
    if (!img) continue;
    try {
      console.log(`  Uploading: ${img.filename} (${(img.buffer.length / 1024).toFixed(0)}KB)...`);
      const newUrl = await adapter.uploadImage(img.buffer, img.filename, img.mimeType);
      if (!newUrl) {
        console.log(`    -> Skipped (platform supports external URLs)`);
        continue;
      }
      // Replace all occurrences of the old URL with the new one
      result = result.replaceAll(img.url, newUrl);
      console.log(`    -> ${newUrl}`);
    } catch (err) {
      console.error(`  Upload failed for ${img.filename}: ${err.message}`);
    }
  }

  return result;
}
