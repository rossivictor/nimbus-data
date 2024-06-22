const chromium = require('chrome-aws-lambda');

(async () => {
  try {
    await chromium.executablePath;
    console.log('Chromium downloaded and configured successfully');
  } catch (error) {
    console.error('Error downloading Chromium:', error);
  }
})();