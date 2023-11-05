import fs from 'fs';
import { spawnSync } from 'child_process';
const lighthouseCli = (await import.meta.resolve('lighthouse/cli')).replace('file://', '');
import { computeMedianRun } from 'lighthouse/core/lib/median-run.js'
import { generateReport } from 'lighthouse'

const url = process.argv[2];

// parse url from command line
if (!url) {
  console.error('Please provide a url');
  process.exit(1);
}

const measuresToTake = 10;

const results = [];
for (let i = 0; i < measuresToTake; i++) {
  console.log(`Running Lighthouse attempt #${i + 1}...`);
  const { status = -1, stdout } = spawnSync('node', [
    lighthouseCli,
    url,
    '--output=json'
  ]);
  if (status !== 0) {
    console.log('Lighthouse failed, skipping run...');
    continue;
  }
  results.push(JSON.parse(stdout.toString()));
}

const median = computeMedianRun(results);

console.log('Median performance score was', median.categories.performance.score * 100);

const report = generateReport(median, 'html')
// create folder 'reports' if it doesn't exist
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}
const currentDateTime = new Date().toUTCString()
const urlString = new URL(url).hostname;
fs.writeFileSync(`reports/${urlString}-report-${currentDateTime}.html`, report, {
  flag: 'w+'
});
