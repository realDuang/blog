import { PlatformAdapter } from './base.mjs';
import { request } from '../utils/http.mjs';

export class JuejinAdapter extends PlatformAdapter {
  name = 'juejin';
  contentFormat = 'markdown';

  getHeaders() {
    return {
      cookie: `sessionid=${this.config.sessionid}`,
      origin: 'https://juejin.cn',
      referer: 'https://juejin.cn/',
    };
  }

  async checkAuth() {
    const { data } = await request(
      'https://api.juejin.cn/user_api/v1/user/get',
      { headers: this.getHeaders() },
    );
    if (data?.err_no !== 0) {
      console.error('  [juejin] Auth failed: sessionid may have expired.');
      console.error('    -> Open https://juejin.cn, login, copy sessionid from DevTools > Application > Cookies');
      return false;
    }
    console.log(`  [juejin] Authenticated as: ${data.data.user_name}`);
    return true;
  }

  // Juejin markdown supports external image URLs directly (COS, etc.)
  // No need to re-upload images to Juejin's image host.
  async uploadImage(buffer, filename, mimeType) {
    return null;
  }

  formatContent(content, meta) {
    return content;
  }

  async createDraft(content, meta) {
    const brief = content.replace(/[#*`>\[\]!\n]/g, '').slice(0, 100);

    const { data } = await request(
      'https://api.juejin.cn/content_api/v1/article_draft/create',
      {
        method: 'POST',
        headers: this.getHeaders(),
        jsonBody: true,
        body: {
          category_id: '0',
          tag_ids: [],
          link_url: '',
          cover_image: '',
          title: meta.title,
          brief_content: brief,
          edit_type: 10, // markdown editor
          html_content: 'none',
          mark_content: content,
        },
      },
    );

    if (data?.err_no !== 0) {
      throw new Error(`Juejin draft creation failed: ${JSON.stringify(data)}`);
    }

    const draftId = data.data.id;
    return {
      id: draftId,
      url: `https://juejin.cn/editor/drafts/${draftId}`,
    };
  }
}
