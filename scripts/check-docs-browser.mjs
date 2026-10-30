import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serveDocs } from './serve-docs.mjs';

const {server, url} = await serveDocs(0);
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({permissions: ['clipboard-read', 'clipboard-write']});
  const page = await context.newPage();
  const errors = [];
  async function checkLabelBounds() {
    const clipped = await page.locator('.mermaid-diagram foreignObject').evaluateAll(labels => labels.flatMap(label => {
      const available = label.getBoundingClientRect();
      return [...label.querySelectorAll('p')].filter(p => {
        const box = p.getBoundingClientRect();
        return box.top < available.top - 1 || box.bottom > available.bottom + 1 || box.left < available.left - 1 || box.right > available.right + 1;
      }).map(p => p.textContent);
    }));
    assert.deepEqual(clipped, [], 'Mermaid labels must fit their measured viewport');
  }
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const files = fs.readdirSync('site-dist').filter(n => n.endsWith('.html') && n !== '404.html');
  for (const width of [1360, 390]) {
    await page.setViewportSize({width, height: 900});
    for (const file of files) {
      await page.goto(url + file, {waitUntil: 'networkidle'});
      assert.equal(await page.locator('main h1').count(), 1, `${file}: one page heading`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file}: overflow at ${width}px`);
      const diagrams = page.locator('.mermaid-diagram');
      for (let i = 0; i < await diagrams.count(); i++) await diagrams.nth(i).locator('svg').waitFor();
      await checkLabelBounds();
    }
  }
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'VPContent');
  await page.locator('.VPNavBarHamburger').click();
  await page.locator('.VPNavScreen a[href$="/getting-started.html"]').click();
  await page.waitForURL('**/getting-started.html');
  const code = await page.locator('main pre code').first().textContent();
  await page.locator('main button.copy').first().click();
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), code);
  await page.setViewportSize({width: 1360, height: 1000});
  await page.locator('.VPSidebar a[href$="/workflow.html"]').click();
  await page.locator('.mermaid-diagram svg').waitFor();
  await checkLabelBounds();
  assert.equal(await page.locator('.VPSidebar').getByText('Project', {exact: true}).count(), 0);
  await page.locator('.VPNavBarSearch button').click();
  await page.locator('#localsearch-input').fill('prefix');
  const result = page.locator('.VPLocalSearchBox a[href*="configuration.html"]').first();
  await result.waitFor();
  await result.click();
  await page.waitForURL('**/configuration.html*');
  await page.locator('main h1').filter({hasText: 'Project configuration'}).waitFor();
  assert.match(await page.locator('main h1').textContent(), /Project configuration/);
  await page.locator('.VPSidebar a[href$="/workflow.html"]').click();
  await page.locator('.mermaid-diagram svg').waitFor();
  fs.mkdirSync('.tmp', {recursive: true});
  await page.screenshot({path: '.tmp/docs-desktop.png', fullPage: false});
  const diagramId = await page.locator('.mermaid-diagram svg').getAttribute('id');
  await page.locator('.VPSwitchAppearance:visible').click();
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
  await page.waitForFunction(previous => document.querySelector('.mermaid-diagram svg')?.id !== previous, diagramId);
  await page.reload({waitUntil: 'networkidle'});
  assert.ok(await page.locator('html').evaluate(element => element.classList.contains('dark')), 'appearance persists after reload');
  await page.locator('.mermaid-diagram svg').waitFor();
  assert.equal(await page.locator('.diagram-error').count(), 0);
  await checkLabelBounds();
  await page.locator('.mermaid-diagram').screenshot({path: '.tmp/docs-diagram-dark.png'});
  await page.screenshot({path: '.tmp/docs-dark.png', fullPage: false});
  await page.locator('.VPSwitchAppearance:visible').click();
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(url + 'configuration.html', {waitUntil: 'networkidle'});
  await page.screenshot({path: '.tmp/docs-mobile.png', fullPage: false});
  assert.deepEqual(errors, [], 'Browser/network errors');
  console.log(`Browser checks passed for ${files.length} pages at desktop/mobile sizes, including search results, persisted light/dark appearance, diagram rerendering, navigation, keyboard access, and clipboard.`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
