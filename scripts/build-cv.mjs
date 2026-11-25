// Builds every CV in resumes/ from its HTML source in resumes/source/ using a headless
// Chromium browser, and writes a PNG preview of each. The CVs are not published on the site.
// All sources share resumes/source/cv.css, the embedded DM Sans font and the aurora header image.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const resumes = join(root, 'resumes');
const sourceDir = join(resumes, 'source');

const cvs = [
  { source: 'cv.html', name: 'Zaid Ali Ansari CV' },
  { source: 'developer-cv.html', name: 'Zaid Ali Ansari Developer CV' },
  { source: 'video-editor-cv.html', name: 'Zaid Ali Ansari Video Editor CV' },
];

const candidates = [
  process.env.CV_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
].filter(Boolean);

const browser = candidates.find((path) => existsSync(path));
if (!browser) {
  console.error('No Edge or Chrome install found. Set CV_BROWSER to a Chromium executable.');
  process.exit(1);
}

function run(args, label) {
  const result = spawnSync(browser, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`${label} failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

// Render the aurora band image that cv.css uses as the header background.
run([
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1588,336',
  `--screenshot=${join(sourceDir, 'cv-aurora.png')}`,
  pathToFileURL(join(sourceDir, 'cv-aurora.html')).href,
], 'Aurora band render');

for (const cv of cvs) {
  const url = pathToFileURL(join(sourceDir, cv.source)).href;
  const pdf = join(resumes, `${cv.name}.pdf`);
  const png = join(sourceDir, `${cv.name}.png`);

  run(['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url], `${cv.name} PDF export`);
  run([
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=794,1123',
    `--screenshot=${png}`,
    url,
  ], `${cv.name} PNG preview`);

  console.log(`PDF: ${pdf}`);
}
