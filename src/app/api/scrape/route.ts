import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import fs from 'fs';
import util from 'util';

const chmod = util.promisify(fs.chmod);

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { url } = await req.json();
    console.log(`URL recebida: ${url}`);

    // Garantir que o caminho do executável é resolvido corretamente
    const executablePath = await chromium.executablePath;

    if (!executablePath) {
      throw new Error('Could not find Chromium executable path.');
    }

    console.log(`Chromium executable path: ${executablePath}`);

    // Ajustar permissões do executável para garantir que ele não está bloqueado
    await chmod(executablePath, 0o755);
    console.log('Permissions adjusted for Chromium executable');

    // Esperar um pequeno tempo antes de iniciar o navegador para garantir que o caminho está disponível
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Launching browser...');
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: executablePath,
      headless: true,
    });
    console.log('Browser launched');

    const page = await browser.newPage();
    console.log('New page created');

    console.log('Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded');

    const phones = await page.evaluate(() => {
      const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
      const matches = document.body && document.body.innerText.match(phoneRegex);
      return matches ? Array.from(matches) : [];
    });
    console.log(`Phones found: ${phones.length}`);

    const whatsappLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="https://api.whatsapp.com"], a[href^="https://wa.me"]')) as HTMLAnchorElement[];
      const uniqueLinks = Array.from(new Set(links.map((link) => link.href)));
      return uniqueLinks.map((link) => ({ link }));
    });
    console.log(`WhatsApp links found: ${whatsappLinks.length}`);

    const emails = await page.evaluate(() => {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
      const matches = document.body.innerText.match(emailRegex);
      return matches ? matches.map(email => email.trim()) : [];
    });
    console.log(`Emails found: ${emails.length}`);

    const socialMedia = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const socialLinks = {
        facebook: anchors.filter(anchor => anchor.href.includes('facebook.com')).map(anchor => anchor.href),
        instagram: anchors.filter(anchor => anchor.href.includes('instagram.com')).map(anchor => anchor.href),
        linkedin: anchors.filter(anchor => anchor.href.includes('linkedin.com')).map(anchor => anchor.href),
        youtube: anchors.filter(anchor => anchor.href.includes('youtube.com')).map(anchor => anchor.href),
        twitter: anchors.filter(anchor => anchor.href.includes('twitter.com')).map(anchor => anchor.href),
      };
      return socialLinks;
    });
    console.log(`Social media links found: ${JSON.stringify(socialMedia)}`);

    const title = await page.title();
    console.log(`Page title: ${title}`);

    await browser.close();

    return NextResponse.json({ phones, whatsappLinks, emails, socialMedia, title });

  } catch (error: any) {
    console.error('Error:', error.message);
    if (browser) {
      await browser.close();
    }
    return NextResponse.json({
      status: 'error',
      message: 'A URL é inválida ou está fora do ar. Por favor, tente novamente.',
      error: error.message,
    }, { status: 500 });
  }
}