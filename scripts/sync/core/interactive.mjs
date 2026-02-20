import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const AVAILABLE_PLATFORMS = ['juejin', 'zhihu', 'wechat', 'bilibili'];

// ---------------------------------------------------------------------------
// Helper: ask a single question via readline
// ---------------------------------------------------------------------------
async function ask(prompt) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(prompt);
    return answer.trim();
  } finally {
    rl.close();
  }
}

// ---------------------------------------------------------------------------
// Check authentication status for all platforms
// ---------------------------------------------------------------------------
export async function checkEnvironment(config, adapterMap) {
  console.log('\nChecking environment...');

  const status = {};

  for (const name of AVAILABLE_PLATFORMS) {
    const platformConfig = config[name];

    if (!platformConfig) {
      status[name] = 'empty';
      console.log(`  [${name}] \u2717 Not configured`);
      continue;
    }

    const hasValues = Object.values(platformConfig).some((v) => v && v.length > 0);
    if (!hasValues) {
      status[name] = 'empty';
      console.log(`  [${name}] \u2717 Not configured`);
      continue;
    }

    const AdapterClass = adapterMap[name];
    if (!AdapterClass) {
      status[name] = 'empty';
      console.log(`  [${name}] \u2717 No adapter`);
      continue;
    }

    try {
      const adapter = new AdapterClass(platformConfig);
      const ok = await adapter.checkAuth();
      if (ok) {
        status[name] = 'ok';
      } else {
        status[name] = 'failed';
        console.log(`  [${name}] \u2717 Auth expired`);
      }
    } catch {
      status[name] = 'failed';
      console.log(`  [${name}] \u2717 Auth failed`);
    }
  }

  console.log();
  return status;
}

// ---------------------------------------------------------------------------
// Main menu: choose action
// ---------------------------------------------------------------------------
export async function selectAction() {
  console.log('What would you like to do?\n');
  console.log('  [1] Login to platforms');
  console.log('  [2] Sync article to platforms');
  console.log('  [3] Preview article locally');
  console.log();

  const answer = await ask('> ');
  const actions = { '1': 'login', '2': 'sync', '3': 'preview' };
  const action = actions[answer];

  if (!action) {
    console.error('Invalid choice. Please enter 1, 2, or 3.');
    process.exit(1);
  }

  return action;
}

// ---------------------------------------------------------------------------
// Scan blogs/ directory for articles, return sorted list
// ---------------------------------------------------------------------------
function scanArticles(projectRoot) {
  const blogsDir = resolve(projectRoot, 'blogs');
  const articles = [];

  let categories;
  try {
    categories = readdirSync(blogsDir).filter((name) => {
      try {
        return statSync(resolve(blogsDir, name)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return articles;
  }

  for (const category of categories) {
    const categoryDir = resolve(blogsDir, category);
    let files;
    try {
      files = readdirSync(categoryDir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }

    for (const file of files) {
      const filePath = resolve(categoryDir, file);
      try {
        // Read first 15 lines — enough to find title and date in frontmatter
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.replace(/\r\n/g, '\n').split('\n').slice(0, 15);

        // Check that file starts with frontmatter
        if (lines[0] !== '---') continue;

        let title = '';
        let dateStr = '';

        for (const line of lines) {
          const titleMatch = line.match(/^title:\s*(.+)/);
          const dateMatch = line.match(/^date:\s*(.+)/);
          if (titleMatch) title = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
          if (dateMatch) dateStr = dateMatch[1].trim();
        }

        if (!title) continue;

        const date = dateStr ? new Date(dateStr) : new Date(0);
        articles.push({ title, date, dateStr: dateStr.slice(0, 10), category, filePath });
      } catch {
        // Skip unreadable files
      }
    }
  }

  // Sort by date descending
  articles.sort((a, b) => b.date - a.date);
  return articles;
}

// ---------------------------------------------------------------------------
// Interactive article selection
// ---------------------------------------------------------------------------
export async function selectArticle(projectRoot) {
  const articles = scanArticles(projectRoot);

  if (articles.length === 0) {
    console.error('No articles found in blogs/ directory.');
    process.exit(1);
  }

  const shown = articles.slice(0, 10);

  console.log('\nRecent articles:\n');
  shown.forEach((a, i) => {
    console.log(`  [${i + 1}] ${a.title} (${a.category}, ${a.dateStr})`);
  });
  console.log(`  [0] Enter path manually`);
  console.log();

  const answer = await ask('> ');
  const idx = Number(answer);

  if (answer === '0') {
    const path = await ask('File path (relative to project root): ');
    if (!path) {
      console.error('No path provided.');
      process.exit(1);
    }
    return resolve(projectRoot, path);
  }

  if (isNaN(idx) || idx < 1 || idx > shown.length) {
    console.error(`Invalid choice. Enter 0-${shown.length}.`);
    process.exit(1);
  }

  return shown[idx - 1].filePath;
}

// ---------------------------------------------------------------------------
// Platform selection with auth status hints
// ---------------------------------------------------------------------------
export async function selectPlatforms(defaultPlatforms = ['juejin'], authStatus = {}) {
  console.log('\nSelect platforms:\n');
  AVAILABLE_PLATFORMS.forEach((name, i) => {
    const marker = defaultPlatforms.includes(name) ? '*' : ' ';
    let hint = '';
    if (authStatus[name] === 'failed') hint = ' (auth expired)';
    else if (authStatus[name] === 'empty') hint = ' (not configured)';
    console.log(`  [${i + 1}]${marker} ${name}${hint}`);
  });
  console.log('\n  * = default from config\n');

  const answer = await ask('Your choices (e.g. 1,3) or Enter for defaults: ');

  if (!answer) {
    console.log(`  Using defaults: ${defaultPlatforms.join(', ')}\n`);
    return defaultPlatforms;
  }

  const indices = answer.split(/[,\s]+/).map(Number);
  const selected = [];

  for (const idx of indices) {
    if (isNaN(idx) || idx < 1 || idx > AVAILABLE_PLATFORMS.length) {
      console.error(`  Invalid choice: "${idx}". Enter numbers 1-${AVAILABLE_PLATFORMS.length}.`);
      process.exit(1);
    }
    selected.push(AVAILABLE_PLATFORMS[idx - 1]);
  }

  return [...new Set(selected)];
}

// ---------------------------------------------------------------------------
// Confirm before sync
// ---------------------------------------------------------------------------
export async function confirmSync() {
  const answer = await ask('Proceed? (Y/n): ');
  const lower = answer.toLowerCase();
  return lower === '' || lower === 'y' || lower === 'yes';
}
