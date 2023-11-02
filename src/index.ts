import fs from 'fs';
import { measure } from "./lighthouse";

const urlParams = process.argv.slice(2);

// parse url from command line
if (!urlParams) {
  console.error('Please provide at least one url');
  process.exit(1);
}

const measuresToTake = 1;

async function executeMeasures() {
  const dateStr = new Date(Date.now()).toISOString()
  for (let urlParam of urlParams) {
    // check if url is valid
    const url = new URL(urlParam);

    // start strings for metrics
    let customReportCSV = `Measured url: ${url}\nItem\t${Array.from({ length: measuresToTake }).map((_, idx) => 'measure' + (idx + 1)).join('\t')}\n`;
    let performanceString = 'Performance\t';
    let firstContentfulPaintString = 'first-contentful-paint ';
    let largestContentfulPaintString = 'largest-contentful-paint ';
    let totalBlockingTimeString = 'total-blocking-time ';
    let cumulativeLayoutShiftString = 'cumulative-layout-shift ';
    let speedIndexString = 'speed-index ';
    let interactiveString = 'interactive ';
    let firstMeaningfulPaintString = 'first-meaningful-paint ';


    for (let i = 0; i < measuresToTake; i++) {
      await measure(url.toString()).then((result) => {
        const { audits } = result.lhr;
        if (i === 0) {
          performanceString += `${result.lhr.categories.performance.score}`;
          firstContentfulPaintString += `(${audits['first-contentful-paint'].numericUnit})\t${audits['first-contentful-paint'].numericValue}`;
          largestContentfulPaintString += `(${audits['largest-contentful-paint'].numericUnit})\t${audits['largest-contentful-paint'].numericValue}`;
          totalBlockingTimeString += `(${audits['total-blocking-time'].numericUnit})\t${audits['total-blocking-time'].numericValue}`;
          cumulativeLayoutShiftString += `(${audits['cumulative-layout-shift'].numericUnit})\t${audits['cumulative-layout-shift'].numericValue}`;
          speedIndexString += `(${audits['speed-index'].numericUnit})\t${audits['speed-index'].numericValue}`;
          interactiveString += `(${audits['interactive'].numericUnit})\t${audits['interactive'].numericValue}`;
          firstMeaningfulPaintString += `(${audits['first-meaningful-paint'].numericUnit})\t${audits['first-meaningful-paint'].numericValue}`;
        } else {
          performanceString += `\t${result.lhr.categories.performance.score}`;
          firstContentfulPaintString += `\t${audits['first-contentful-paint'].numericValue}`;
          largestContentfulPaintString += `\t${audits['largest-contentful-paint'].numericValue}`;
          totalBlockingTimeString += `\t${audits['total-blocking-time'].numericValue}`;
          cumulativeLayoutShiftString += `\t${audits['cumulative-layout-shift'].numericValue}`;
          speedIndexString += `\t${audits['speed-index'].numericValue}`;
          interactiveString += `\t${audits['interactive'].numericValue}`;
          firstMeaningfulPaintString += `\t${audits['first-meaningful-paint'].numericValue}`;
        }
      })
    }

    customReportCSV += `${performanceString}\n${firstContentfulPaintString}\n${largestContentfulPaintString}\n${totalBlockingTimeString}\n${cumulativeLayoutShiftString}\n${speedIndexString}\n${interactiveString}\n${firstMeaningfulPaintString}\n`;
    // create folder 'reports' if it doesn't exist
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports');
    }
    fs.appendFileSync(`reports/lh-report${dateStr}.tsv`, customReportCSV);
  }
}

executeMeasures().then(() => {
  console.log('done');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
})