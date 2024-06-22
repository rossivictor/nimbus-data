const chrome = require('chrome-aws-lambda');
const { existsSync, mkdirSync, copyFileSync } = require('fs');
const path = require('path');

(async () => {
  const executablePath = await chrome.executablePath;
  console.log(`Chromium executable path: ${executablePath}`);

  const targetPath = '/var/task/.next/server/app/api/bin';
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }

  const sourcePath = path.resolve(executablePath);
  const targetFilePath = path.join(targetPath, 'chromium.br');

  copyFileSync(sourcePath, targetFilePath);
  console.log(`Chromium copied to ${targetFilePath}`);
})();