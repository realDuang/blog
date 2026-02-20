import { PlatformAdapter } from './base.mjs';
import { request, buildFileForm } from '../utils/http.mjs';

export class BilibiliAdapter extends PlatformAdapter {
  name = 'bilibili';
  contentFormat = 'html';

  getHeaders() {
    return {
      cookie: `SESSDATA=${this.config.SESSDATA}; bili_jct=${this.config.bili_jct}`,
      origin: 'https://www.bilibili.com',
      referer: 'https://member.bilibili.com/article-text/home',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    };
  }

  async checkAuth() {
    const { data } = await request(
      'https://api.bilibili.com/x/web-interface/nav',
      { headers: this.getHeaders() },
    );

    if (data?.code !== 0 || !data?.data?.isLogin) {
      console.error('  [bilibili] Auth failed: SESSDATA may have expired.');
      console.error('    -> Open https://www.bilibili.com, login, copy SESSDATA and bili_jct from DevTools > Application > Cookies');
      return false;
    }
    console.log(`  [bilibili] Authenticated as: ${data.data.uname}`);
    return true;
  }

  async uploadImage(buffer, filename, mimeType) {
    const form = buildFileForm('binary', buffer, filename, mimeType, {
      csrf: this.config.bili_jct,
    });

    const { data } = await request(
      'https://api.bilibili.com/x/article/creative/article/upcover',
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: form,
      },
    );

    if (data?.code !== 0 || !data?.data?.url) {
      throw new Error(`Bilibili image upload failed: ${JSON.stringify(data)}`);
    }

    // Bilibili returns protocol-relative URL, normalize to https
    let url = data.data.url;
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    return url;
  }

  formatContent(content, meta) {
    return content;
  }

  async createDraft(content, meta) {
    // Extract image URLs from content for the image_urls field
    const imgUrls = [];
    const imgRe = /<img\s[^>]*src="([^"]+)"[^>]*>/g;
    let match;
    while ((match = imgRe.exec(content)) !== null) {
      imgUrls.push(match[1]);
    }

    const params = new URLSearchParams();
    params.append('title', meta.title);
    params.append('content', content);
    params.append('summary', (meta.title || '').slice(0, 200));
    params.append('banner_url', '');
    params.append('tid', '4'); // 科技 category
    params.append('reprint', '0'); // original
    params.append('tags', (meta.tags || []).join(','));
    params.append('image_urls', imgUrls.join(','));
    params.append('origin_image_urls', imgUrls.join(','));
    params.append('csrf', this.config.bili_jct);

    const { data } = await request(
      'https://api.bilibili.com/x/article/creative/draft/addupdate',
      {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    if (data?.code !== 0) {
      throw new Error(`Bilibili draft creation failed: ${JSON.stringify(data)}`);
    }

    const aid = data.data?.aid;
    return {
      id: String(aid),
      url: `https://member.bilibili.com/article-text/home?aid=${aid}`,
    };
  }
}
