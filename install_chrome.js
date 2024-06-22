const puppeteer = require('puppeteer');

(async () => {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('126.0.6478.63');
  console.log('Downloaded Chrome revision', revisionInfo.revision);
})();