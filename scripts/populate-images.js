const fs = require('fs');
const path = require('path');
const https = require('https');

const MENU_PATH = path.join(__dirname, '..', 'data', 'menu.json');
const OUT_DIR = path.join(__dirname, '..', 'data', 'menu');
const STYLE_SUFFIX =
  'cinematic food photography, dark moody background, warm amber lighting, ' +
  'professional restaurant plating, shallow depth of field, high detail, luxury dining';

const CATEGORY_BASE = { starters: 0, mains: 100, desserts: 200 };
const MIN_BYTES = 1024;

const buildPrompt = (item) => `${item.name}, ${item.description}, ${STYLE_SUFFIX}`;

const buildUrl = (item) => {
  const suffix = parseInt(item.id.split('_')[1], 10);
  const seed = (CATEGORY_BASE[item.categoryId] ?? 0) + suffix;
  const encoded = encodeURIComponent(buildPrompt(item));
  return `https://image.pollinations.ai/prompt/${encoded}?width=600&height=600&nologo=true&seed=${seed}`;
};

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

fs.mkdirSync(OUT_DIR, { recursive: true });
const items = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));

const download = (url, dest) =>
  new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { timeout: 120000 }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => resolve({ ok: false, statusCode: res.statusCode }));
        res.resume();
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const size = fs.statSync(dest).size;
          if (size < MIN_BYTES) {
            fs.unlink(dest, () => resolve({ ok: false, statusCode: 200, bytes: size }));
          } else {
            resolve({ ok: true, statusCode: 200, bytes: size });
          }
        });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      file.close();
      fs.unlink(dest, () => resolve({ ok: false, error: 'timeout' }));
    });
    req.on('error', (e) => {
      file.close();
      fs.unlink(dest, () => resolve({ ok: false, error: e.message }));
    });
  });

const fetchWithRetry = async (url, dest, retriesLeft = 2) => {
  const r = await download(url, dest);
  if (r.ok) return r;
  if (retriesLeft > 0) {
    const isQuota = r.statusCode === 402 || r.statusCode === 429 || r.error === 'timeout';
    const wait = isQuota ? 60000 : 3500;
    await new Promise((res) => setTimeout(res, wait));
    return fetchWithRetry(url, dest, retriesLeft - 1);
  }
  return r;
};

(async () => {
  console.log(`[1/2] Generating images for ${items.length} items into ${OUT_DIR}`);
  let okCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const filename = `${slug(it.name)}.jpg`;
    const dest = path.join(OUT_DIR, filename);
    const relPath = `data/menu/${filename}`;

    process.stdout.write(`  (${i + 1}/${items.length}) ${it.name.padEnd(28)} ... `);

    if (fs.existsSync(dest) && fs.statSync(dest).size >= MIN_BYTES) {
      it.image = relPath;
      skipCount++;
      process.stdout.write(`SKIP (already on disk)\n`);
      continue;
    }

    const r = await fetchWithRetry(buildUrl(it), dest);
    if (r.ok) {
      it.image = relPath;
      okCount++;
      process.stdout.write(`OK (${(r.bytes / 1024).toFixed(0)} KB)\n`);
    } else {
      failCount++;
      process.stdout.write(`FAIL (${r.statusCode || r.error || 'unknown'})\n`);
    }

    await new Promise((res) => setTimeout(res, 4000));
  }

  console.log(`\n[2/2] Writing updated menu.json`);
  fs.writeFileSync(MENU_PATH, JSON.stringify(items, null, 2) + '\n');

  console.log(`\nDone. downloaded: ${okCount}, skipped: ${skipCount}, failed: ${failCount} (of ${items.length}).`);
  if (failCount > 0) {
    console.log('Failed items can be retried by re-running this script — successful ones are skipped.');
  }
})();
