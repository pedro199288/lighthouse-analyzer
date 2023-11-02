import fs from 'fs';
import lighthouse, { Flags } from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

type Options = {
  output: 'csv' | 'html' | 'json';
  reportOutputFile: string;
};

export async function measure(url: string, options?: Options) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'], startingUrl: url });
  const flags = { logLevel: 'info', output: options?.output, onlyCategories: ['performance'], port: chrome.port } satisfies Flags;
  const runnerResult = await lighthouse(url, flags);

  if (!runnerResult) {
    throw new Error('No runner result');
  }

  if (options?.reportOutputFile) {
    const reportHtml = runnerResult.report;
    if (Array.isArray(reportHtml)) {
      console.log('reporthtml is an array') // TODO: handle this case
    } else {
      // create folder 'reports' if it doesn't exist
      if (!fs.existsSync('reports')) {
        fs.mkdirSync('reports');
      }
      fs.writeFileSync(`reports/lhreport.${options.output}`, reportHtml);
    }
  }

  console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
  const performance = runnerResult.lhr.categories.performance;
  if (!performance.score) { throw new Error('No performance score'); }
  console.log('Performance score was', performance.score * 100);

  await chrome.kill();

  return runnerResult
}