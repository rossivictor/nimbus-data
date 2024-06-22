const puppeteer = require('puppeteer-core');

(async () => {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('901912'); // Revisão suportada do Chromium para Puppeteer 10.4.0
  console.log('Downloaded Chrome revision', revisionInfo.revision);
})();