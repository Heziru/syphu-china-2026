import { launchReviewBrowser } from "./browser-review.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { build } from "esbuild";
const bundled = await build({entryPoints:["src/contents/home/journey/storyTimeline.ts"],bundle:true,platform:"node",format:"esm",write:false});
const t = await import("data:text/javascript;base64,"+Buffer.from(bundled.outputFiles[0].text).toString("base64"));
const out="outputs/approved-home-implementation";
mkdirSync(out,{recursive:true});
const browser=await launchReviewBrowser();
const errors=[], results=[];
const base="http://127.0.0.1:5186/syphu-china/";
async function jump(page, fraction) {
  await page.evaluate(f=>{
    const section=document.querySelector(".continuous-journey"), sticky=document.querySelector(".cosmic-journey__sticky");
    window.scrollTo({top: section.getBoundingClientRect().top+scrollY-56+f*(section.offsetHeight-sticky.offsetHeight),behavior:"instant"});
  },fraction);
  const p=t.journeyPosition(fraction);
  const chapter=p.bridge!==null?'why':p.delivery!==null?'delivery':p.product!==null?'product':t.NARRATIVE[t.stageAt(p.progress)].id;
  await page.waitForFunction(expected=>document.querySelector('.continuous-journey')?.dataset.stage===expected,chapter);
  await page.waitForTimeout(500);
}
const scenes=[
  ["opening",t.storyScrollPosition(0.001)],["heatmap",t.storyScrollPosition(.21)],
  ["everyday",t.storyScrollPosition(.295)],["medicine",t.bridgeScrollPosition(.22)],
  ["living-cells",t.bridgeScrollPosition(.6)],["ecn",t.bridgeScrollPosition(.93)],
  ["delivery",t.deliveryScrollPosition(.56)],["colon",t.storyScrollPosition(.449)],
  ["surface",t.storyScrollPosition(.5)],["response",t.storyScrollPosition(.588)],
  ["payload",t.storyScrollPosition(.669)],["exit",t.storyScrollPosition(.75)],
  ["product-idea",t.productScrollPosition(.17)],["product-response",t.productScrollPosition(.485)],
  ["product-purpose",t.productScrollPosition(.825)],["campus",t.storyScrollPosition(.82)],
  ["library",t.storyScrollPosition(.89)],["evidence",t.storyScrollPosition(.945)]
];
try {
  for(const [device,viewport] of [["desktop",{width:1440,height:900}],["phone",{width:390,height:844}]]) {
    const page=await browser.newPage({viewport,deviceScaleFactor:1});
    page.on("pageerror",e=>errors.push(device+": "+e.message));
    page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
    await page.goto(base,{waitUntil:"networkidle"});
    await page.locator(".continuous-journey").waitFor();
    await page.evaluate(()=>document.fonts.ready);
    for(const [scene,fraction] of scenes) {
      await jump(page,fraction);
      if(scene==='heatmap') {
        await page.waitForFunction(()=>document.querySelector('.world-type__year')?.textContent==='2019');
        assert.ok((await page.locator('.world-type__counts').textContent()).includes('4.90'),'2019 IBD data is present');
      }
      if(scene.startsWith("product")) await page.waitForTimeout(650);
      const result=await page.evaluate(()=>{
        const imgs=[...document.querySelectorAll(".continuous-journey img")];
        return {stage:document.querySelector(".continuous-journey").dataset.stage,
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          broken:imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc),
          font:getComputedStyle(document.querySelector(".continuous-journey")).fontFamily};
      });
      assert.equal(result.overflow,false,device+" "+scene+" horizontal overflow");
      assert.deepEqual(result.broken,[],device+" "+scene+" incomplete images");
      assert.ok(result.font.includes("SYPHU Nunito"));
      await page.screenshot({path:out+"/"+device+"-"+scene+".png"});
      results.push({device,scene,...result});
    }
    await jump(page,t.storyScrollPosition(.449));
    await page.getByRole("button",{name:"Look inside the colonic surface"}).click();
    await page.waitForTimeout(1100);
    assert.ok(await page.locator(".heroLanding").isVisible(),"Colon magnifier opens surface");
    await page.getByRole("button",{name:"Response",exact:true}).click();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator(".science-atlas").getAttribute("data-science-phase"),"engineered-ecn");
    assert.ok((await page.locator(".science-atlas__ip img").getAttribute("src")).includes("ecn-original"));
    await jump(page,t.productScrollPosition(.17));
    await page.getByRole("button",{name:"Purpose",exact:true}).click();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator(".product-chapter").getAttribute("data-product-stage"),"capsule");
    await jump(page,t.deliveryScrollPosition(.12));
    await page.getByRole("button",{name:"Colon",exact:true}).click();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator(".delivery-journey").getAttribute("data-region"),"Colon");
    assert.ok((await page.locator("[data-capsule]").getAttribute("href")).includes("product-capsule"));
    await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
  reduced.on("pageerror",e=>errors.push("reduced "+e.message));
  await reduced.goto(base,{waitUntil:"networkidle"});
  assert.ok(await reduced.locator(".cosmic-journey--static").count());
  for(const [key,selector] of [["surface",".heroLanding--static"],["product",".product-chapter--static"],["evidence",".research-collage--static"]]){
    if(await reduced.locator(selector).count()) {
      await reduced.locator(selector).scrollIntoViewIfNeeded();
      await reduced.screenshot({path:out+"/reduced-"+key+".png"});
    }
  }
  assert.equal(await reduced.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);
  writeFileSync(out+"/review.json",JSON.stringify({errors,results,interactions:"colon → surface → response; product stage nav; delivery stop nav; reduced reading mode"},null,2));
  console.log("Approved homepage: desktop/phone 18 scenes each, asset loading, typography, scroll navigation and reduced-motion checks passed.");
} finally { await browser.close(); }

