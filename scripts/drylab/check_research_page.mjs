import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { launchReviewBrowser } from '../browser-review.mjs';

const output = fileURLToPath(new URL('../../outputs/dry-lab-upgrade-20261009/final-qa/', import.meta.url));
await mkdir(output, { recursive: true });
const base = process.env.REVIEW_URL || 'http://127.0.0.1:5186/syphu-china';
const browser = await launchReviewBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1040 }, deviceScaleFactor: 1 });
// Measure layout after navigation, without Bootstrap's smooth-scroll animation.
await page.emulateMedia({ reducedMotion: 'reduce' });
const report = { base, pageErrors: [], badResponses: [], pages: {}, downloads: [], screenshots: [] };
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('response', response => {
  if (response.status() >= 400) report.badResponses.push({ url: response.url(), status: response.status() });
});
async function capture(name, target) {
  if (target) await page.locator(target).first().evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 94, behavior: 'instant' }));
  else await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('.research-figure img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: output + name + '.png' });
  report.screenshots.push(name);
}
async function inspect() {
  return page.evaluate(() => ({
    title: document.title,
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    mainWidth: document.querySelector('.research-page')?.getBoundingClientRect().width,
    equations: document.querySelectorAll('.research-equation').length,
    equationOrder: [...document.querySelectorAll('.research-equation')].map(el => Number(el.id.replace('eq-', ''))),
    formulaErrors: document.querySelectorAll('.katex-error').length,
    figures: [...document.querySelectorAll('.research-figure img')].map(img => ({ src: img.src, loaded: img.complete && img.naturalWidth > 0 })),
    references: document.querySelectorAll('.research-references li').length,
    brokenHashes: [...document.querySelectorAll('.research-page a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(id => !document.getElementById(id)),
  }));
}
try {
  await page.goto(base + '/model#transport', { waitUntil: 'networkidle' });
  await page.locator('.research-article').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => Math.abs(document.querySelector('#transport').getBoundingClientRect().top - 94) < 3);
  const before = await page.locator('#transport').evaluate(element => element.getBoundingClientRect().top);
  await page.locator('.research-figure img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
  await page.locator('.research-figure img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  const after = await page.locator('#transport').evaluate(element => element.getBoundingClientRect().top);
  report.anchorLoading = { before, after };
  if (Math.abs(before - after) > 2 || Math.abs(after - 94) > 3) throw new Error('Images shifted the direct chapter link');
  await page.goto(base + '/model', { waitUntil: 'networkidle' });
  await page.locator('.research-article').waitFor();
  await page.locator('.research-figure img').evaluateAll(images => images.forEach(img => img.loading = 'eager'));
  await page.waitForFunction(() => [...document.querySelectorAll('.research-figure img')].every(img => img.complete && img.naturalWidth));
  await page.evaluate(() => document.fonts.ready);
  report.pages.desktop = await inspect();
  await capture('01-model-overview');
  await capture('02-framework', '#fig-1');
  await capture('03-interface', '#fig-3');
  await capture('04-binding-derivation', '#binding');
  await capture('05-binding-figure', '#fig-4');
  await capture('06-ecological-landscape', '#fig-5');
  await capture('07-spatial-transport', '#fig-6');
  await capture('08-transport-landscape', '#fig-7');
  await capture('09-uncertainty', '#fig-12');
  await capture('10-release-law', '#fig-13');
  await capture('11-verification', '#fig-14');
  const code = page.locator('.research-code').first();
  if (!(await code.locator('pre').isVisible())) throw new Error('Code is not directly visible');
  if (!(await code.locator('.hljs span').count())) throw new Error('Code syntax highlighting is absent');
  if (await code.locator('summary').count()) throw new Error('Unnecessary code disclosure remains');
  await capture('12-code', '.research-code');
  await page.locator('#structure-3d').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.researchStructureViewer__frame')?.getAttribute('aria-busy') === 'false');
  if (await page.locator('#structure-3d').evaluate(el => Boolean(el.closest('details')))) throw new Error('Structure viewer is folded');
  if (await page.locator('.researchStructureViewer__fallback').count()) throw new Error('Molecular viewer fell back from WebGL');
  await capture('18-direct-structure', '#structure-3d');
  await capture('19-project-pathway', '#project-pathway');
  await capture('20-retention', '.adhesion-replay');
  await page.locator('#adhesion-time').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('#adhesion-time')?.disabled);
  await page.getByRole('button', { name: 'Play simulation replay', exact: true }).click();
  await page.waitForFunction(() => Number(document.querySelector('#adhesion-time')?.value) > 2);
  await page.getByRole('button', { name: 'Pause simulation replay', exact: true }).click();
  await page.getByRole('button', { name: 'No wall binding', exact: true }).click();
  const bound = await page.locator('.adhesion-ledger div').filter({ has: page.locator('dt', { hasText: /^Bound$/ }) }).locator('dd').textContent();
  if (bound !== '0.00%') throw new Error('No-binding control has a nonzero bound population: ' + bound);
  await page.getByRole('button', { name: 'Reversible binding', exact: true }).click();
  await capture('21-retention-running-result', '.adhesion-replay');
  await capture('30-colon-particles', '#particle-transport');
  await page.locator('.particle-replay').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector('#particle-time')?.disabled);
  const particleCanvas = page.locator('.particle-replay canvas');
  const initialTime = Number(await particleCanvas.getAttribute('data-time'));
  await page.getByRole('button', { name: 'Play particle replay', exact: true }).click();
  await page.waitForFunction(t => Number(document.querySelector('.particle-replay canvas')?.dataset.time) > t, initialTime);
  await page.getByRole('button', { name: 'Pause particle replay', exact: true }).click();
  await page.locator('#particle-time').fill('60');
  await page.waitForFunction(() => document.querySelector('.particle-replay canvas')?.dataset.time === '60');
  const particleCounts = await page.locator('.particle-ledger dd').allTextContents();
  const particleData = await (await page.request.get(base + '/assets/dry-lab/adhesion/particle-replay.json')).json();
  const frame = particleData.frames[particleData.time_s.indexOf(60)];
  const expectedCounts = ['free', 'attached', 'exited', 'shed'].map(key => frame.ledger[key]);
  if (particleCounts.some((text, i) => Number(text.replaceAll(',', '')) !== expectedCounts[i])) throw new Error('Particle replay count mismatch');
  if (expectedCounts.reduce((a, b) => a + b, 0) !== particleData.simulated_particle_count) throw new Error('Particle count conservation failed');
  if (Number(await particleCanvas.getAttribute('data-visible-particles')) !== frame.particles.filter(p => p[2] < 2).length) throw new Error('Terminal particles are still displayed');
  if (!particleData.geometry.kind.includes('colon')) throw new Error('Colon display geometry is missing');
  report.particles = { geometry: particleData.geometry.kind, time: 60, counts: expectedCounts, shown: Number(await particleCanvas.getAttribute('data-visible-particles')) };
  await capture('31-colon-replay', '.particle-replay');
  await capture('22-data-sources', '#data-sources');
  if (await page.locator('#atomistic').count()) {
    await capture('23-atomistic', '#atomistic');
    await capture('32-docking-closeup', '#docking-closeup');
    const viewer = page.locator('.atomistic-viewer');
    if (await viewer.evaluate(el => Boolean(el.closest('details')))) throw new Error('Computed poses are folded');
    await page.waitForFunction(() => document.querySelector('.atomistic-viewer-frame')?.getAttribute('aria-busy') === 'false');
    if (await page.locator('.atomistic-viewer-fallback').count()) throw new Error('Computed-pose WebGL failed');
    await viewer.locator('select').selectOption('1');
    await page.waitForFunction(() => document.querySelector('.atomistic-viewer-frame')?.getAttribute('aria-busy') === 'false');
    await viewer.getByRole('checkbox').check();
    await capture('24-computed-docking', '.atomistic-viewer');
    await capture('25-md-dynamics', '#fig-A3');
    await capture('26-md-contacts', '#fig-A4');
    const md = await (await page.request.get(base + '/assets/dry-lab/atomistic/md-summary.json')).json();
    report.molecularRuns = { count: md.number_of_completed_replicas, durationNs: md.total_production_ns, seeds: md.replicas.map(r => r.seed) };
    if (md.number_of_completed_replicas !== 3 || md.total_production_ns !== 3 || new Set(md.replicas.map(r => r.seed)).size !== 3) throw new Error('MD pilot set is incomplete');
  }
  const downloads = new Set(await page.locator('.research-page a[download]').evaluateAll(links => links.map(link => link.href)));
  await page.locator('.research-sidebar a[href="#references"]').click();
  if (!page.url().endsWith('#references')) throw new Error('Contents navigation failed');
  await capture('13-references', '#references');
  await page.setViewportSize({ width: 390, height: 844 });
  report.pages.mobile = await inspect();
  await capture('14-mobile-overview');
  await capture('15-mobile-equations', '#eq-5');
  await capture('27-mobile-docking', '.atomistic-viewer');
  await capture('28-mobile-md', '#fig-A3');
  await capture('29-mobile-retention', '.adhesion-replay');
  await capture('33-mobile-particles', '#particle-transport');
  await capture('34-mobile-particle-replay', '.particle-replay');
  await page.locator('.research-mobile-contents summary').click();
  await page.locator('.research-mobile-contents a[href="#transport"]').click();
  if (!page.url().endsWith('#transport')) throw new Error('Mobile contents navigation failed');
  await capture('16-mobile-transport', '#transport');
  await page.setViewportSize({ width: 320, height: 780 });
  report.pages.smallMobile = await inspect();
  await page.goto(base + '/software', { waitUntil: 'networkidle' });
  await page.locator('.research-software').waitFor();
  report.pages.softwareMobile = await inspect();
  (await page.locator('.research-page a[download]').evaluateAll(links => links.map(link => link.href))).forEach(url => downloads.add(url));
  await page.setViewportSize({ width: 1440, height: 1040 });
  await capture('17-software');
  for (const url of downloads) {
    const response = await page.request.get(url);
    const type = response.headers()['content-type'] || '';
    report.downloads.push({ url, status: response.status(), type, bytes: (await response.body()).length });
    if (!response.ok() || type.includes('text/html')) throw new Error('Invalid download ' + url);
  }
  for (const [name, data] of Object.entries(report.pages)) {
    if (data.documentWidth > data.width + 1) throw new Error(name + ' overflows horizontally');
    if (data.formulaErrors || data.brokenHashes.length) throw new Error(name + ' has invalid formula or hash');
  }
  if (report.pages.desktop.equations !== 27 || report.pages.desktop.figures.length !== 21 || report.pages.desktop.references < 9) throw new Error('Missing research sections');
  if (report.pages.desktop.equationOrder.some((n, i) => n !== i + 1)) throw new Error('Equation numbering is not sequential');
  if (report.pageErrors.length || report.badResponses.length) throw new Error('Browser errors or failed responses');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  await writeFile(output + 'research-page-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, failure: report.failure, pages: Object.fromEntries(Object.entries(report.pages).map(([name, data]) => [name, { width: data.width, documentWidth: data.documentWidth, equations: data.equations, figures: data.figures.length }])), downloads: report.downloads.length, pageErrors: report.pageErrors, badResponses: report.badResponses }));
  await browser.close();
}
