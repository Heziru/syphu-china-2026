import { launchReviewBrowser } from './browser-review.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const out = 'outputs/painted-opening';
mkdirSync(out, {recursive:true});
const browser = await launchReviewBrowser();
const errors = [], assets = new Set(), shots = [];
try {
  for (const [device,width,height] of [['desktop',1440,960],['mobile',390,844]]) {
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
    page.on('response',response=>{
      if(response.url().includes('/assets/story/solar/')) {
        assert.equal(response.status(),200);
        assets.add(response.url().split('/').pop());
      }
    });
    await page.goto('http://127.0.0.1:5182/syphu-china/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('.solar-painted-backdrop')?.naturalWidth > 0);
    for(const [name,progress] of [['opening',0],['title',.04],['solar',.072],['departure',.12],['world',.17],['campus',.855],['return',0]]) {
      await page.evaluate(p=>{
        const section=document.querySelector('.continuous-journey');
        const sticky=document.querySelector('.cosmic-journey__sticky');
        const fraction=(p+(p>=.32?.5:0))/1.5;
        scrollTo({top:section.getBoundingClientRect().top+scrollY-56+(section.offsetHeight-sticky.offsetHeight)*fraction,behavior:'instant'});
      },progress);
      await page.waitForTimeout(850);
      const backdrop=page.locator('.solar-painted-backdrop');
      if(progress===0) assert.equal(await backdrop.count(),1);
      if(progress>=.17) assert.equal(await backdrop.count(),0,'painted opening gives way to the existing interactive world');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      assert.equal(await page.locator('.cosmic-journey--static').count(),0,'no shader fallback');
      const path=`${out}/${name}-${device}.png`;
      await page.screenshot({path});
      shots.push(path);
    }
    await page.close();
  }
  assert.deepEqual(errors,[]);
  assert.ok(assets.has('painted-planets.png') && assets.has('paper-stardust.png'));
  const result={passed:true,assets:[...assets],errors,shots};
  writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
