/**
 * Abstract base class for platform adapters.
 * Each platform adapter must extend this and implement all methods.
 */
export class PlatformAdapter {
  /** @type {string} Platform identifier */
  name = 'base';

  /** @type {'markdown' | 'html'} Content format the platform accepts */
  contentFormat = 'markdown';

  /**
   * @param {object} config - Platform-specific config from .sync.config.json
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Upload a single image to the platform's image host.
   * @param {Buffer} buffer - Image binary data
   * @param {string} filename - Original filename
   * @param {string} mimeType - MIME type (e.g. "image/png")
   * @returns {Promise<string>} Platform-hosted image URL
   */
  async uploadImage(buffer, filename, mimeType) {
    throw new Error(`${this.name}: uploadImage() not implemented`);
  }

  /**
   * Transform processed content into platform-specific format.
   * Called AFTER image URLs have been replaced.
   * @param {string} content - Markdown or HTML content
   * @param {object} meta - Article metadata (title, date, categories, tags)
   * @returns {string} Final content ready for the platform
   */
  formatContent(content, meta) {
    return content;
  }

  /**
   * Create a draft on the platform.
   * @param {string} content - Formatted content
   * @param {object} meta - Article metadata
   * @returns {Promise<{ id: string, url?: string }>}
   */
  async createDraft(content, meta) {
    throw new Error(`${this.name}: createDraft() not implemented`);
  }

  /**
   * Validate that current cookies/tokens are still working.
   * @returns {Promise<boolean>}
   */
  async checkAuth() {
    throw new Error(`${this.name}: checkAuth() not implemented`);
  }

  /**
   * Build common HTTP headers for this platform.
   * @returns {object}
   */
  getHeaders() {
    return {};
  }
}
