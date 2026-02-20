import { chromium } from 'playwright-core';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BROWSER_PROFILE_DIR = resolve(__dirname, '..', '.browser-profile');

// ---------------------------------------------------------------------------
// Platform login configurations (data-driven)
// ---------------------------------------------------------------------------
const PLATFORM_LOGIN_CONFIG = {
  juejin: {
    name: 'Juejin',
    loginUrl: 'https://juejin.cn/login',
    cookiesToExtract: ['sessionid'],
    cookieMapping: { sessionid: 'sessionid' },
    detection: { type: 'cookie', cookieName: 'sessionid' },
  },

  zhihu: {
    name: 'Zhihu',
    loginUrl: 'https://www.zhihu.com/signin',
    cookiesToExtract: ['z_c0', '_xsrf'],
    cookieMapping: { z_c0: 'z_c0', _xsrf: '_xsrf' },
    detection: { type: 'cookie', cookieName: 'z_c0' },
  },

  bilibili: {
    name: 'Bilibili',
    loginUrl: 'https://www.bilibili.com',
    cookiesToExtract: ['SESSDATA', 'bili_jct'],
    cookieMapping: { SESSDATA: 'SESSDATA', bili_jct: 'bili_jct' },
    detection: { type: 'cookie', cookieName: 'SESSDATA' },
  },

  wechat: {
    name: 'WeChat MP',
    loginUrl: 'https://mp.weixin.qq.com/',
    cookiesToExtract: [],
    cookieMapping: {},
    detection: {
      type: 'url',
      urlPattern: /cgi-bin\/home.*token=(\d+)/,
    },
  },
};

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 1000;

// ---------------------------------------------------------------------------
// Cookie-based login detection (Juejin / Zhihu / Bilibili)
// Polls context.cookies() until the target cookie appears.
// ---------------------------------------------------------------------------
async function waitForCookieLogin(context, platformConfig) {
  const { cookieName } = platformConfig.detection;
  const startTime = Date.now();

  while (Date.now() - startTime < LOGIN_TIMEOUT_MS) {
    const cookies = await context.cookies();
    const targetCookie = cookies.find(
      (c) => c.name === cookieName && c.value && c.value.length > 0,
    );

    if (targetCookie) {
      const result = {};
      for (const name of platformConfig.cookiesToExtract) {
        const found = cookies.find((c) => c.name === name);
        const configKey = platformConfig.cookieMapping[name] || name;
        result[configKey] = found ? found.value : '';
      }
      return result;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Login timeout: no "${cookieName}" cookie detected within 5 minutes.`);
}

// ---------------------------------------------------------------------------
// URL-based login detection (WeChat MP)
// Waits for URL redirect containing token parameter, then extracts full
// cookie string and token value.
// ---------------------------------------------------------------------------
async function waitForUrlLogin(context, page, platformConfig) {
  const { urlPattern } = platformConfig.detection;

  await page.waitForURL(
    (url) => urlPattern.test(url.href),
    { timeout: LOGIN_TIMEOUT_MS },
  ).catch((err) => {
    if (err.name === 'TimeoutError') {
      throw new Error('Login timeout: WeChat MP login not detected within 5 minutes.');
    }
    throw err;
  });

  // Extract token from URL
  const currentUrl = page.url();
  const tokenMatch = currentUrl.match(urlPattern);
  const token = tokenMatch ? tokenMatch[1] : '';

  if (!token) {
    throw new Error('Login redirect detected but token not found in URL.');
  }

  // Join all relevant cookies into a single cookie header string
  const cookies = await context.cookies();
  const cookieString = cookies
    .filter((c) => c.domain.includes('.qq.com') || c.domain.includes('weixin'))
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  return { cookie: cookieString, token };
}

// ---------------------------------------------------------------------------
// Login flow for a single platform.
// Opens a visible Chrome window, waits for manual login, extracts credentials.
// ---------------------------------------------------------------------------
async function loginPlatform(platformName) {
  const platformConfig = PLATFORM_LOGIN_CONFIG[platformName];
  if (!platformConfig) {
    throw new Error(`Unknown platform: ${platformName}`);
  }

  if (!existsSync(BROWSER_PROFILE_DIR)) {
    mkdirSync(BROWSER_PROFILE_DIR, { recursive: true });
  }

  console.log(`\n  [${platformConfig.name}] Opening browser...`);
  console.log(`  [${platformConfig.name}] Please log in manually in the browser window.`);
  console.log(`  [${platformConfig.name}] Timeout: 5 minutes.\n`);

  let context;
  try {
    context = await chromium.launchPersistentContext(BROWSER_PROFILE_DIR, {
      channel: 'chrome',
      headless: false,
      viewport: { width: 1280, height: 800 },
      locale: 'zh-CN',
    });
  } catch (err) {
    if (err.message.includes('Executable doesn\'t exist') || err.message.includes('Failed to launch')) {
      throw new Error(
        'Cannot find Google Chrome. Please install Chrome or set the CHROME_PATH environment variable.',
      );
    }
    throw err;
  }

  const page = context.pages()[0] || await context.newPage();

  try {
    await page.goto(platformConfig.loginUrl, { waitUntil: 'domcontentloaded' });

    let credentials;
    if (platformConfig.detection.type === 'cookie') {
      credentials = await waitForCookieLogin(context, platformConfig);
    } else if (platformConfig.detection.type === 'url') {
      credentials = await waitForUrlLogin(context, page, platformConfig);
    }

    console.log(`  [${platformConfig.name}] Login detected!`);
    return credentials;
  } catch (err) {
    if (err.message.includes('Target closed') || err.message.includes('Target page, context or browser has been closed')) {
      throw new Error('Browser window was closed before login completed.');
    }
    throw err;
  } finally {
    await context.close().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Run login for one or all platforms.
// Returns the updated config object with new credentials merged in.
// ---------------------------------------------------------------------------
export async function runLogin(target, config, adapterMap) {
  const AVAILABLE = Object.keys(PLATFORM_LOGIN_CONFIG);

  const platforms = target === 'all'
    ? AVAILABLE
    : [target];

  for (const p of platforms) {
    if (!AVAILABLE.includes(p)) {
      console.error(`  Unknown platform: "${p}". Available: ${AVAILABLE.join(', ')}`);
      process.exit(1);
    }
  }

  for (const platformName of platforms) {
    const platformConfig = PLATFORM_LOGIN_CONFIG[platformName];

    // Check if already authenticated
    const AdapterClass = adapterMap[platformName];
    if (AdapterClass && config[platformName]) {
      const hasValues = Object.values(config[platformName]).some((v) => v && v.length > 0);
      if (hasValues) {
        try {
          const adapter = new AdapterClass(config[platformName]);
          const ok = await adapter.checkAuth();
          if (ok) {
            console.log(`  [${platformConfig.name}] Already authenticated. Skipping.`);
            continue;
          }
        } catch {
          // Auth check failed, proceed to login
        }
      }
    }

    try {
      const credentials = await loginPlatform(platformName);

      // Merge credentials into config
      config[platformName] = {
        ...config[platformName],
        ...credentials,
      };

      console.log(`  [${platformConfig.name}] Credentials saved.`);

      // Verify credentials work
      if (AdapterClass) {
        console.log(`  [${platformConfig.name}] Verifying...`);
        const adapter = new AdapterClass(config[platformName]);
        const ok = await adapter.checkAuth();
        if (!ok) {
          console.warn(`  [${platformConfig.name}] Warning: checkAuth returned false. Credentials saved anyway.`);
        }
      }
    } catch (err) {
      const name = platformConfig?.name || platformName;
      console.error(`  [${name}] Login failed: ${err.message}`);
      // Continue with next platform if doing 'all'
    }
  }

  return config;
}
