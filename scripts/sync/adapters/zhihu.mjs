import { PlatformAdapter } from './base.mjs';
import { request } from '../utils/http.mjs';
import { createHash, createHmac } from 'node:crypto';

export class ZhihuAdapter extends PlatformAdapter {
  name = 'zhihu';
  contentFormat = 'html';

  getHeaders() {
    return {
      cookie: `z_c0=${this.config.z_c0}; _xsrf=${this.config._xsrf}`,
      'x-xsrftoken': this.config._xsrf,
      origin: 'https://zhuanlan.zhihu.com',
      referer: 'https://zhuanlan.zhihu.com/',
    };
  }

  async checkAuth() {
    const { data, status } = await request('https://api.zhihu.com/people/self', {
      headers: this.getHeaders(),
    });
    if (status === 401 || data?.error) {
      console.error('  [zhihu] Auth failed: z_c0 cookie may have expired.');
      console.error('    -> Open https://www.zhihu.com, login, copy z_c0 and _xsrf from DevTools > Application > Cookies');
      return false;
    }
    console.log(`  [zhihu] Authenticated as: ${data.name || 'unknown'}`);
    return true;
  }

  async uploadImage(buffer, filename, mimeType) {
    // Step 1: Declare image and get upload credentials
    const md5 = createHash('md5').update(buffer).digest('hex');
    const { data: initData } = await request('https://api.zhihu.com/images', {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'content-type': 'application/json',
      },
      jsonBody: true,
      body: {
        image_hash: md5,
        source: 'article',
      },
    });

    const uploadFile = initData.upload_file;
    const uploadToken = initData.upload_token;

    if (!uploadFile) {
      throw new Error(`Zhihu image init failed: ${JSON.stringify(initData)}`);
    }

    const ext = filename.split('.').pop();

    // If image already exists (state === 1), no upload needed
    if (uploadFile.state === 1) {
      return `https://pic1.zhimg.com/v2-${md5}.${ext}`;
    }

    if (!uploadToken) {
      throw new Error(`Zhihu image init: no upload token: ${JSON.stringify(initData)}`);
    }

    const objectKey = uploadFile.object_key;

    // Step 2: Upload to Zhihu's Ali OSS via STS credentials
    const ossEndpoint = 'https://zhihu-pics-upload.zhimg.com';
    const ossUrl = `${ossEndpoint}/${objectKey}`;
    const date = new Date().toUTCString();

    // Build OSS V1 signature (HMAC-SHA1)
    // Note: Even with CNAME endpoint, OSS resolves to bucket "zhihu-pics"
    // and includes it in the CanonicalizedResource for signature validation
    const canonicalizedOSSHeaders = `x-oss-security-token:${uploadToken.access_token}`;
    const canonicalizedResource = `/zhihu-pics/${objectKey}`;

    const stringToSign = [
      'PUT',
      '', // Content-MD5 (empty)
      mimeType,
      date,
      canonicalizedOSSHeaders + '\n' + canonicalizedResource,
    ].join('\n');

    const signature = createHmac('sha1', uploadToken.access_key)
      .update(stringToSign, 'utf8')
      .digest('base64');

    const authorization = `OSS ${uploadToken.access_id}:${signature}`;

    const ossRes = await fetch(ossUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'Date': date,
        'Authorization': authorization,
        'x-oss-security-token': uploadToken.access_token,
      },
      body: buffer,
    });

    if (!ossRes.ok) {
      const errText = await ossRes.text();
      throw new Error(`Zhihu OSS upload failed (${ossRes.status}): ${errText}`);
    }

    return `https://pic1.zhimg.com/${objectKey}.${ext}`;
  }

  formatContent(content, meta) {
    return content;
  }

  async createDraft(content, meta) {
    // Create draft
    const { data, status } = await request(
      'https://zhuanlan.zhihu.com/api/articles/drafts',
      {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'content-type': 'application/json',
        },
        jsonBody: true,
        body: {
          title: meta.title,
          content: content,
        },
      },
    );

    if (!data?.id) {
      throw new Error(`Zhihu draft creation failed (${status}): ${JSON.stringify(data)}`);
    }

    return {
      id: String(data.id),
      url: `https://zhuanlan.zhihu.com/p/${data.id}/edit`,
    };
  }
}
