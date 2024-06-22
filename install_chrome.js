const { install } = require('chrome-aws-lambda');

(async () => {
  try {
    await install();
    console.log('Chromium downloaded and configured successfully');
  } catch (error) {
    console.error('Error downloading Chromium:', error);
  }
})();