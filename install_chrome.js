const chrome = require('chrome-aws-lambda');
const { existsSync, mkdirSync, copyFileSync } = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Starting Chrome installation...');
    const executablePath = await chrome.executablePath;

    if (!executablePath) {
      throw new Error('Executable path not found.');
    }

    console.log(`Chromium executable path: ${executablePath}`);

    const targetPath = '/var/task/.next/server/app/api/bin';
    if (!existsSync(targetPath)) {
      mkdirSync(targetPath, { recursive: true });
    }

    const sourcePath = path.resolve(executablePath);
    const targetFilePath = path.join(targetPath, 'chromium');

    copyFileSync(sourcePath, targetFilePath);
    console.log(`Chromium copied to ${targetFilePath}`);
  } catch (error) {
    console.error('Error during installation:', error);
    process.exit(1);
  }
})();