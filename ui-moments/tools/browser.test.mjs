import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

let temp;
let server;
let browser;
let site;

before(async () => {
  temp = await mkdtemp(join(tmpdir(), 'ui-moments-'));
  const artifact = fileURLToPath(new URL('../_site', import.meta.url));
  await symlink(artifact, join(temp, 'ui-moments'), 'dir');
  server = spawn('python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', temp], {
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  server.stdout.setEncoding('utf8');
  const address = await Promise.race([
    once(server.stdout, 'data').then(([line]) => line.match(/port (\d+)/)?.[1]),
    once(server, 'exit').then(([code]) => { throw new Error(`静态服务器启动失败：${code}`); }),
  ]);
  assert.ok(address, '静态服务器应输出监听端口');
  site = `http://127.0.0.1:${address}/ui-moments/`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  if (server?.kill()) await once(server, 'exit');
  if (temp) await rm(temp, { recursive: true, force: true });
});

async function clickHeading(page, card, name) {
  const heading = card.getByRole('heading', { name, exact: true });
  await heading.scrollIntoViewIfNeeded();
  const box = await heading.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('发布包子路径下可搜索、操作滑尺、下载 HTML 并复制提示词', { timeout: 30_000 }, async t => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  t.after(() => page.close());
  page.setDefaultTimeout(5_000);
  const errors = [];
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(site) && response.status() >= 400) errors.push(response.url());
  });
  await page.goto(site);
  await page.locator('html[data-ready="true"]').waitFor({ state: 'attached' });
  assert.equal(await page.locator('.ui-item').count(), 232);
  await page.frameLocator('[data-ui="ink-switch"] iframe').getByRole('switch', { name: 'Ink Switch' }).waitFor();
  assert.equal(await page.evaluate(() => window.scrollY), 0, '嵌入控件载入后首页仍停在顶部');
  assert.ok(await page.locator('.ui-stage .ui-animation').count() < 35, '首页只挂载近屏的循环动效');
  assert.ok(!requests.some(url => url.endsWith('/gallery/loading-ui/dist/THIRD_PARTY_LICENSES.txt')), '首屏不请求第三方导出许可');
  await page.getByRole('link', { name: '试试果冻方块' }).click();
  await page.locator('#component-detail[open]').getByRole('heading', { name: '果冻方块' }).waitFor();
  await page.locator('#component-close').click();

  const search = page.locator('#work-search');
  await search.fill('日期选择器');
  await page.locator('#empty').waitFor();
  for (const path of ['gallery/date-picker/', 'gallery/date-picker/dist/']) {
    const response = await page.request.get(new URL(path, site).href);
    assert.equal(response.status(), 404, path);
  }

  await search.fill('弹性滑尺');
  const card = page.locator('[data-ui="elastic-ruler"]');
  assert.equal(await page.locator('.ui-item:visible').count(), 1);
  const ruler = card.frameLocator('iframe').getByRole('slider', { name: '滑尺位置' });
  const value = Number(await ruler.inputValue());
  await ruler.press('ArrowRight');
  assert.equal(Number(await ruler.inputValue()), value + 1);
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await clickHeading(page, card, '弹性滑尺');
  await page.frameLocator('#component-frame').getByRole('slider', { name: '滑尺位置' }).waitFor();
  const save = page.locator('#component-detail [data-save-work]');
  await save.click();
  assert.equal(await save.getAttribute('aria-pressed'), 'true');
  await page.locator('#component-close').click();
  await page.waitForURL(url => !url.hash);
  await search.fill('');
  await page.reload();
  await page.locator('#gallery-favorites').click();
  assert.equal(await page.locator('.ui-item:visible').count(), 1);
  await card.getByRole('button', { name: '详情 弹性滑尺' }).press('Enter');
  await save.waitFor({ state: 'visible' });
  assert.equal(await save.getAttribute('aria-pressed'), 'true');
  await save.click();
  await page.locator('#component-close').click();
  await page.locator('#empty').waitFor();
  await page.locator('#gallery-favorites').click();

  await page.locator('#categories [data-category="feedback"]').click();
  assert.equal(await page.locator('.ui-item:visible').count(), 12);
  await page.locator('[data-shape="摆动"]').click();
  assert.equal(await page.locator('.ui-item:visible').count(), 4);
  await page.locator('#categories [data-category="loading"]').click();
  assert.equal(await page.locator('.ui-item:visible').count(), 164);
  const foldAnimations = () => {
    const shadow = document.querySelector('[data-ui="paper-fold"] .ui-animation')?.shadowRoot;
    return shadow?.getAnimations().map(animation => animation.playState) ?? [];
  };
  await page.locator('[data-ui="paper-fold"] .ui-animation').waitFor();
  await page.locator('#motion').click();
  assert.ok(await page.locator('[data-ui="paper-fold"] .ui-playback').isDisabled());
  const states = await page.evaluate(foldAnimations);
  assert.ok(states.length > 0 && states.every(state => state === 'paused'));
  await page.locator('#motion').click();
  const ring = page.locator('[data-ui="ring"]');
  const playback = ring.locator('.ui-playback');
  await playback.click();
  assert.equal(await playback.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await playback.click();
  assert.equal(await playback.getAttribute('aria-pressed'), 'false');
  await clickHeading(page, ring, 'Ring');
  await page.locator('#detail[open]').waitFor();
  await page.locator('#prop-size').fill('96');
  assert.match(await page.locator('#code').inputValue(), /Griffin Johnston/);
  await page.locator('#tab-html').press('ArrowRight');
  assert.equal(await page.locator('#tab-react').getAttribute('aria-selected'), 'true');
  await page.locator('#detail .dialog-actions .primary').click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /size: 96/);
  await page.locator('#tab-react').press('ArrowLeft');
  const download = page.waitForEvent('download');
  await page.locator('#download').click();
  const exported = join(temp, 'ring.html');
  await (await download).saveAs(exported);
  await page.goto(pathToFileURL(exported).href);
  await page.locator('svg').first().waitFor({ state: 'visible' });
  assert.deepEqual(errors, []);
});

test('手机风格库切换外观时保留控件状态，深链接可直接打开', { timeout: 30_000 }, async t => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('styles.html?style=bauhaus#bookmark-press', site).href);
  const preview = page.frameLocator('#preview-stage iframe:visible');
  await preview.locator('html[data-ui-style="bauhaus"]').waitFor({ state: 'attached' });
  const bookmark = preview.getByRole('button', { name: '收藏' });
  await bookmark.tap();
  assert.equal(await bookmark.getAttribute('aria-pressed'), 'true');
  await page.locator('#style-options label[data-ui-style="pixel"]').tap();
  await preview.locator('html[data-ui-style="pixel"]').waitFor({ state: 'attached' });
  assert.equal(await bookmark.getAttribute('aria-pressed'), 'true');
  assert.equal(new URL(page.url()).searchParams.get('style'), 'pixel');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);

  assert.equal(await page.locator('#component-options label').filter({ hasText: '日期选择器' }).count(), 0);
  await page.locator('#catalog-link').click();
  await page.locator('#component-detail[open]').getByRole('heading', { name: '夹页键' }).waitFor();
  await page.locator('#component-close').tap();
  await page.locator('#categories [data-category="input"]').tap();
  const card = page.locator('[data-ui="bookmark-press"]');
  // 交互控件按需挂载：卡片接近视口后才创建 iframe。
  await card.scrollIntoViewIfNeeded();
  const inlineBookmark = card.frameLocator('iframe').getByRole('button', { name: '收藏' });
  await inlineBookmark.tap();
  assert.equal(await inlineBookmark.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await card.getByRole('button', { name: '详情 夹页键' }).tap();
  await page.locator('#component-detail[open]').getByRole('heading', { name: '夹页键' }).waitFor();
  assert.deepEqual(errors, []);
});

test('动效资源失败时其余画廊可浏览，失败卡片可重试', { timeout: 15_000 }, async t => {
  const page = await browser.newPage();
  t.after(() => page.close());
  await page.route('**/gallery/loading-ui/dist/runtime.js', route => route.fulfill({ status: 404 }), { times: 1 });
  await page.goto(`${site}?q=loading-ui-ring`);
  const card = page.locator('[data-ui="loading-ui-ring"]');
  const retry = card.getByRole('button', { name: '重试 Ring 预览' });
  await retry.waitFor({ state: 'visible' });
  await retry.click();
  await card.locator('.ui-animation').waitFor();
  await page.locator('#work-search').fill('折页');
  await page.locator('[data-ui="paper-fold"] .ui-animation').waitFor();
});

test('原创控件支持键盘操作，嵌入时只显示所选控件', { timeout: 20_000 }, async t => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('gallery/originals/index.html', site).href);

  const ink = page.getByRole('switch', { name: 'Ink Switch' });
  await ink.press('Space');
  assert.equal(await ink.getAttribute('aria-checked'), 'true');

  const dial = page.getByRole('slider', { name: 'Detent Dial' });
  await dial.press('ArrowUp');
  await dial.press('PageUp');
  assert.equal(await dial.getAttribute('aria-valuenow'), '7');
  await dial.press('End');
  assert.equal(await dial.getAttribute('aria-valuenow'), '10');

  const stepper = page.getByRole('spinbutton', { name: 'Odometer Stepper' });
  await stepper.press('ArrowUp');
  await stepper.press('ArrowUp');
  assert.equal(await stepper.getAttribute('aria-valuenow'), '10');
  await stepper.press('Home');
  assert.equal(await stepper.getAttribute('aria-valuenow'), '0');

  const tabs = page.getByRole('tab');
  await tabs.nth(1).press('ArrowRight');
  assert.equal(await tabs.nth(2).getAttribute('aria-selected'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'M');

  const hold = page.locator('.hold');
  await hold.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(1350);
  await page.keyboard.up('Space');
  assert.equal(await page.locator('#hold-status').textContent(), 'Deleted');

  await page.goto(new URL('gallery/originals/index.html?embed=ui&theme=light&sample=tide-progress', site).href);
  assert.equal(await page.locator('.sample:visible').count(), 1);
  assert.equal(await page.locator('#tide-progress').isVisible(), true);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
  assert.deepEqual(errors, []);
});

test('第二、三批原创控件可用键盘完成主要操作', { timeout: 25_000 }, async t => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  t.after(() => page.close());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(new URL('gallery/originals/visual.html', site).href);
  const bloom = page.getByRole('switch', { name: 'Bloom Toggle' });
  await bloom.press('Space');
  assert.equal(await bloom.getAttribute('aria-checked'), 'true');
  await page.goto(new URL('gallery/originals/color.html', site).href);
  const cord = page.getByRole('switch', { name: 'Pull Cord Lamp' });
  await cord.press('Enter');
  assert.equal(await cord.getAttribute('aria-checked'), 'true');
  const hue = page.getByRole('slider', { name: 'Hue Orbit' });
  await hue.press('ArrowRight');
  assert.equal(await hue.getAttribute('aria-valuenow'), '300');

  await page.goto(new URL('gallery/originals/motion.html', site).href);
  const fan = page.getByRole('button', { name: 'Card Fan' });
  await fan.press('Enter');
  assert.equal(await fan.getAttribute('aria-expanded'), 'true');
  const flow = page.getByRole('group', { name: 'Cover Flow' });
  await flow.press('ArrowRight');
  assert.equal(await page.locator('#flow-status').textContent(), 'Card 4 of 5');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.press('Enter');
  assert.equal(await page.locator('.menu').getAttribute('aria-expanded'), 'true');

  await page.goto(new URL('gallery/originals/gestures.html', site).href);
  const swipe = page.getByRole('button', { name: 'Swipe to Confirm' });
  await swipe.press('Enter');
  assert.equal(await page.locator('#swipe-status').textContent(), 'Confirmed');
  const rocker = page.getByRole('switch', { name: 'Rocker Switch' });
  await rocker.press('Space');
  assert.equal(await rocker.getAttribute('aria-checked'), 'true');
  const wave = page.getByRole('slider', { name: 'Scrub Wave' });
  await wave.press('End');
  assert.equal(await wave.getAttribute('aria-valuenow'), '100');
  await page.getByRole('button', { name: 'Radial Menu' }).press('Enter');
  await page.getByRole('button', { name: 'Save' }).waitFor();
  const steps = page.getByRole('progressbar', { name: 'Step Track' });
  await page.getByRole('button', { name: 'Next step' }).click();
  assert.equal(await steps.getAttribute('aria-valuenow'), '3');
  await page.getByRole('application', { name: 'Snap Grid' }).press('ArrowRight');
  assert.equal(await page.locator('#snap-status').textContent(), 'Row 2, column 3');

  await page.goto(new URL('gallery/originals/elastic.html', site).href);
  const stretch = page.getByRole('switch', { name: 'Stretch Toggle' });
  await stretch.press('Space');
  assert.equal(await stretch.getAttribute('aria-checked'), 'true');
  await page.getByRole('tab', { name: 'Home' }).press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: 'Search' }).getAttribute('aria-selected'), 'true');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: /Cart, 1 item/ }).waitFor();
  const volume = page.getByRole('slider', { name: 'Bulge Volume' });
  await volume.press('End');
  assert.equal(await volume.getAttribute('aria-valuenow'), '100');
  await page.getByRole('button', { name: 'Elastic Accordion' }).press('Enter');
  assert.equal(await page.locator('.acc-head').getAttribute('aria-expanded'), 'true');

  await page.goto(new URL('gallery/originals/inputs.html', site).href);
  const notch = page.getByRole('slider', { name: 'Notch Slider' });
  await notch.press('ArrowRight');
  assert.equal(await notch.getAttribute('aria-valuetext'), 'L');
  const chips = page.getByRole('textbox', { name: 'New tag' });
  await chips.fill('original');
  await chips.press('Enter');
  assert.equal(await page.locator('.chip').count(), 3);
  await chips.press('Backspace');
  await page.waitForFunction(() => document.querySelectorAll('.chip').length === 2);

  await page.goto(new URL('gallery/originals/actions.html', site).href);
  const like = page.getByRole('button', { name: 'Like' });
  await like.press('Enter');
  assert.equal(await like.getAttribute('aria-pressed'), 'true');
  await page.getByRole('textbox', { name: 'Digit 1' }).focus();
  await page.keyboard.type('2468');
  assert.equal(await page.locator('.code-hint').textContent(), 'Verified');
  assert.deepEqual(errors, []);
});
