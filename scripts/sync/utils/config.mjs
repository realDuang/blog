import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');
const CONFIG_PATH = resolve(PROJECT_ROOT, '.sync.config.json');

const DEFAULT_CONFIG = {
  defaultPlatforms: ['juejin'],
  juejin: { sessionid: '' },
  zhihu: { z_c0: '', _xsrf: '' },
  wechat: { cookie: '', token: '' },
  bilibili: { SESSDATA: '', bili_jct: '' },
};

export function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    console.error(`Config file not found: ${CONFIG_PATH}`);
    console.error('Creating a template. Please fill in your cookies/tokens.');
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
    process.exit(1);
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
}

export function getProjectRoot() {
  return PROJECT_ROOT;
}
