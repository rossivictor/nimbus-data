import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.VERCEL ? '/usr/bin/google-chrome-stable' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      timeout: 60000,
    });
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.toString()));
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const phones = await page.evaluate(() => {
      const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
      const matches = document.body && document.body.innerText.match(phoneRegex);
      return matches ? Array.from(matches) : [];
    });

    let whatsAppLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="https://api.whatsapp.com"]')) as HTMLAnchorElement[];
        return links.map((link) => {
            const url = new URL(link.href);
            const phone = url.searchParams.get('phone');
            return { link: link.href, phone };
        });
    });

    const emails = await page.evaluate(() => {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
      const matches = document.body.innerText.match(emailRegex);
      return matches ? matches.map(email => email.trim()) : [];
    });

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

    const title = await page.title();

    if (phones.length === 0 && emails.length === 0) {
      const contactLink = await page.evaluate(() => {
        const contactAnchor = Array.from(document.querySelectorAll('a')).find((anchor) =>
          anchor.href.includes('fale-conosco') ||
          anchor.href.includes('contact')
        );
        return contactAnchor ? contactAnchor.href : null;
      });

      if (contactLink) {
        await page.goto(contactLink, { waitUntil: 'networkidle2', timeout: 60000 });

        const phones = await page.evaluate(() => {
          const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
          const matches = document.body && document.body.innerText.match(phoneRegex);
          return matches ? Array.from(matches) : [];
        });

        const whatsAppLinks = await page.evaluate(() => {
          const links = document.querySelectorAll('a[href^="https://api.whatsapp.com"]');
          return links ? Array.from(links, (link: Element) => {
            const anchor = link as HTMLAnchorElement;
            const url = new URL(anchor.href);
            const phone = url.searchParams.get('phone');
            return { link: anchor.href, phone };
          }) : [];
        });

        const emails = await page.evaluate(() => {
          const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
          const matches = document.body.innerText.match(emailRegex);
          return matches ? Array.from(matches) : [];
        });
      }
    }

    await browser.close();

    return NextResponse.json({ phones, whatsAppLinks, emails, socialMedia, title });

  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.error();
  }
}