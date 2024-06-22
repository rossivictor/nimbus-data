import { install } from 'chrome-aws-lambda';

(async () => {
  await install({
    cacheDir: '/tmp/puppeteer_cache',
  });

  console.log('Chromium downloaded and configured successfully');
})();