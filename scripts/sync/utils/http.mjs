/**
 * Lightweight fetch wrapper with cookie injection and error handling.
 */

/**
 * Make an HTTP request with common defaults.
 * @param {string} url
 * @param {object} options - Standard fetch options + extra helpers
 * @param {object} [options.headers] - Request headers
 * @param {string} [options.method] - HTTP method
 * @param {object|string|FormData} [options.body] - Request body
 * @param {boolean} [options.jsonBody] - If true, auto-stringify body and set content-type
 * @returns {Promise<{ ok: boolean, status: number, data: any, raw: Response }>}
 */
export async function request(url, options = {}) {
  const { jsonBody, ...fetchOpts } = options;

  // Auto JSON body
  if (jsonBody && fetchOpts.body && typeof fetchOpts.body === 'object' && !(fetchOpts.body instanceof FormData)) {
    fetchOpts.body = JSON.stringify(fetchOpts.body);
    fetchOpts.headers = {
      'content-type': 'application/json',
      ...fetchOpts.headers,
    };
  }

  const res = await fetch(url, fetchOpts);

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
    raw: res,
  };
}

/**
 * Build a FormData with a file field.
 * @param {string} fieldName - Form field name for the file
 * @param {Buffer} buffer - File binary data
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 * @param {object} [extraFields] - Additional form fields
 * @returns {FormData}
 */
export function buildFileForm(fieldName, buffer, filename, mimeType, extraFields = {}) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  form.append(fieldName, blob, filename);
  for (const [key, value] of Object.entries(extraFields)) {
    form.append(key, value);
  }
  return form;
}
