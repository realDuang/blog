import { PlatformAdapter } from './base.mjs';
import { request, buildFileForm } from '../utils/http.mjs';

export class WechatAdapter extends PlatformAdapter {
  name = 'wechat';
  contentFormat = 'html';
  _commonData = null;

  getHeaders() {
    return {
      cookie: this.config.cookie,
      referer: 'https://mp.weixin.qq.com/',
      origin: 'https://mp.weixin.qq.com',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    };
  }

  /**
   * Fetch the MP homepage and extract commonData (ticket, user_name, time, etc.)
   * needed for image upload and draft creation.
   */
  async _fetchCommonData() {
    if (this._commonData) return this._commonData;

    const token = this.config.token;
    const { data: html } = await request(
      `https://mp.weixin.qq.com/cgi-bin/home?t=home/index&token=${token}&lang=zh_CN`,
      { headers: this.getHeaders() },
    );

    if (typeof html !== 'string') {
      throw new Error('Failed to fetch WeChat MP homepage');
    }

    // Extract window.wx.commonData or cgiData from the HTML
    const ticketMatch = html.match(/ticket\s*[:=]\s*["']([^"']+)["']/);
    const userNameMatch = html.match(/user_name\s*[:=]\s*["']([^"']+)["']/);
    const timeMatch = html.match(/time\s*[:=]\s*(\d+)/);
    const nickNameMatch = html.match(/nick_name\s*[:=]\s*["']([^"']*?)["']/);

    this._commonData = {
      ticket: ticketMatch?.[1] || '',
      user_name: userNameMatch?.[1] || '',
      time: timeMatch?.[1] || String(Math.floor(Date.now() / 1000)),
      nick_name: nickNameMatch?.[1] || '',
    };

    return this._commonData;
  }

  async checkAuth() {
    const token = this.config.token;
    if (!token) {
      console.error('  [wechat] No token configured.');
      console.error('    -> Login to mp.weixin.qq.com, copy token from URL param and full cookie from DevTools');
      return false;
    }

    const { data, status } = await request(
      `https://mp.weixin.qq.com/cgi-bin/home?t=home/index&token=${token}&lang=zh_CN&f=json&ajax=1`,
      { headers: this.getHeaders() },
    );

    // JSON response with redirect or error means auth failed
    if (status === 302 || (typeof data === 'object' && data.base_resp?.ret !== 0)) {
      console.error('  [wechat] Auth failed: token/cookie expired (~2h TTL).');
      console.error('    -> Re-login to mp.weixin.qq.com, update token and cookie in .sync.config.json');
      return false;
    }

    // HTML response that redirects to login page
    if (typeof data === 'string' && (data.includes('/cgi-bin/bizlogin') || data.includes('登录'))) {
      console.error('  [wechat] Auth failed: token/cookie expired (~2h TTL).');
      console.error('    -> Re-login to mp.weixin.qq.com, update token and cookie in .sync.config.json');
      return false;
    }

    console.log('  [wechat] Authenticated');
    return true;
  }

  async uploadImage(buffer, filename, mimeType) {
    const token = this.config.token;
    const commonData = await this._fetchCommonData();
    const now = Date.now();

    // Build the correct filetransfer URL with all required params
    const params = new URLSearchParams({
      action: 'upload_material',
      f: 'json',
      scene: '8',
      writetype: 'doublewrite',
      groupid: '1',
      ticket_id: commonData.user_name,
      ticket: commonData.ticket,
      svr_time: commonData.time,
      token: token,
      lang: 'zh_CN',
      seq: String(now),
      t: String(Math.random()),
    });

    const url = `https://mp.weixin.qq.com/cgi-bin/filetransfer?${params.toString()}`;

    // Build FormData with required fields
    const form = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    form.append('type', mimeType);
    form.append('id', String(now));
    form.append('name', filename);
    form.append('lastModifiedDate', new Date().toString());
    form.append('size', String(buffer.length));
    form.append('file', blob, filename);

    const { data } = await request(url, {
      method: 'POST',
      headers: {
        cookie: this.config.cookie,
        referer: 'https://mp.weixin.qq.com/cgi-bin/appmsg',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      body: form,
    });

    if (!data?.cdn_url) {
      throw new Error(`WeChat image upload failed: ${JSON.stringify(data)}`);
    }

    return data.cdn_url;
  }

  formatContent(content, meta) {
    return content;
  }

  async createDraft(content, meta) {
    const token = this.config.token;

    // Use FormData instead of URLSearchParams for draft creation
    const form = new FormData();

    // Required article fields (index 0 for single article)
    form.append('count', '1');
    form.append('title0', meta.title);
    form.append('content0', content);
    form.append('digest0', (meta.title || '').slice(0, 54));
    form.append('author0', '');
    form.append('fileid0', '');
    form.append('cdn_url0', '');
    form.append('cdn_235_1_url0', '');
    form.append('cdn_1_1_url0', '');
    form.append('show_cover_pic0', '0');
    form.append('need_open_comment0', '0');
    form.append('only_fans_can_comment0', '0');
    form.append('content_source_url0', '');
    form.append('sourceurl_check0', '');
    form.append('feed_cover_type0', '0');
    form.append('pic_crop_235_1_0', '');
    form.append('pic_crop_1_1_0', '');
    form.append('shortvideofileid0', '');
    form.append('copyright_type0', '0');
    form.append('releasefirst0', '');
    form.append('platform0', '');
    form.append('reprint_permit_type0', '');
    form.append('allow_reprint0', '0');
    form.append('allow_reprint_modify0', '0');
    form.append('original_article_type0', '');
    form.append('can_reward0', '0');
    form.append('related_video0', '');
    form.append('is_video_recommend0', '');
    form.append('share_page_type0', '0');
    form.append('share_imageinfo0', '{"list":[]}');
    form.append('share_video_id0', '');
    form.append('dot0', '{}');
    form.append('mmlistenitem0', '');
    form.append('insert_ad_mode0', '');

    // Global fields
    form.append('isnew', '0');
    form.append('isMp498', '0');

    const { data } = await request(
      `https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=77&token=${token}&lang=zh_CN`,
      {
        method: 'POST',
        headers: {
          cookie: this.config.cookie,
          referer: `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&token=${token}&lang=zh_CN`,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        body: form,
      },
    );

    if (data?.base_resp?.ret !== 0) {
      throw new Error(`WeChat draft creation failed: ${JSON.stringify(data)}`);
    }

    const appMsgId = data.appMsgId || 'unknown';
    return {
      id: String(appMsgId),
      url: `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&appmsgid=${appMsgId}&token=${token}&lang=zh_CN`,
    };
  }
}
