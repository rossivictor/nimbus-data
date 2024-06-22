const puppeteer = require('puppeteer');

(async () => {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('901912'); // Revisão suportada do Chromium
  console.log('Downloaded Chrome revision', revisionInfo.revision);
})();