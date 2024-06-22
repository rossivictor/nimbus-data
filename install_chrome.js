const { install } = require('chrome-aws-lambda');
const { existsSync, mkdirSync } = require('fs');
const path = require('path');

(async () => {
  const executablePath = await install();
  console.log(`Chromium downloaded and configured successfully at ${executablePath}`);

  const binDir = path.dirname(executablePath);
  const targetPath = '/var/task/.next/server/app/api/bin';

  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }

  // Copy Chromium to the target directory
  const { copyFileSync } = require('fs');
  copyFileSync(executablePath, path.join(targetPath, 'chromium.br'));

  console.log(`Chromium copied to ${targetPath}`);
})();