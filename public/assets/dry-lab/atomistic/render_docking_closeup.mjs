// Coordinate-based interface plate, independent of the frozen MD analysis.
// Run from the research bundle: node scripts/drylab/atomistic/render_docking_closeup.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { launchReviewBrowser } from '../../browser-review.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'public/assets/dry-lab/atomistic');
const input = path.join(out, 'docking/human-ne-elafin/geometry-candidate.pdb');
const pdb = await fs.readFile(input, 'utf8');
const width = 1700, height = 980;
const browser = await launchReviewBrowser();
try {
  const page = await browser.newPage({ viewport: { width, height: 1220 }, deviceScaleFactor: 2 });
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;background:#fff;color:#26373d;font-family:Arial,sans-serif}
    header{height:128px;padding:28px 58px 0}h1{font-size:36px;line-height:1.15;margin:0 0 15px;font-weight:700;letter-spacing:-.4px}
    header p{margin:0;color:#65767b;font-size:19px}#scene{position:relative;width:${width}px;height:${height}px}
    #viewer,#labels{position:absolute;inset:0;width:100%;height:100%}#labels{pointer-events:none}
    footer{height:112px;padding:12px 58px 15px;font-size:17px;color:#596d73;line-height:1.5}
    footer strong{color:#394e55;font-weight:600}.legend{position:absolute;bottom:10px;left:58px;display:flex;gap:30px;font-size:17px;color:#445e63;align-items:center}
    .swatch{width:26px;height:7px;display:inline-block;vertical-align:middle;margin-right:9px}.el{width:12px;height:12px;display:inline-block;border-radius:100%;margin-right:5px}
    @page{size:1700px 1220px;margin:0}
  </style></head><body><header><h1>A closer view of the predicted NE–Elafin interface</h1><p>Human neutrophil elastase · Elafin reactive loop &nbsp;|&nbsp; HDOCK original rank 29 · post-hoc geometric candidate</p></header>
  <main id="scene"><div id="viewer"></div><svg id="labels" viewBox="0 0 ${width} ${height}"></svg>
  <div class="legend"><span><i class="swatch" style="background:#83aaa3"></i>NE · chain E</span><span><i class="swatch" style="background:#d9a095"></i>Elafin · chain I</span><span><i class="el" style="background:#858c92"></i>C &nbsp;<i class="el" style="background:#d64a4b"></i>O &nbsp;<i class="el" style="background:#426aba"></i>N &nbsp;<i class="el" style="background:#e7ba42"></i>S</span></div></main>
  <footer><strong>Dashed segments report heavy-atom separations, not assigned hydrogen bonds.</strong> The 2.18 Å O···O contact is unusually short.<br>Unrelaxed rigid-body prediction; residue numbers follow mature Elafin and NE author numbering. No experimentally validated interface or affinity is implied.</footer></body></html>`);
  await page.addScriptTag({ path: path.join(root, 'public/assets/dry-lab/vendor/3Dmol-2.5.5.min.js') });
  const data = await page.evaluate(({ pdb, width, height }) => {
    const viewer = window.$3Dmol.createViewer(document.querySelector('#viewer'), { backgroundColor: 'white', antialias: true });
    window.closeupViewer = viewer;
    const model = viewer.addModel(pdb, 'pdb', { noComputeSecondaryStructure: true });
    const atoms = model.selectedAtoms({});
    const selected = { E: [57,192,193,195], I: [24,25,26,27] };
    const xyz = a => ({x:a.x,y:a.y,z:a.z});
    const atom = (chain,resi,name) => {
      const a = model.selectedAtoms({chain,resi,atom:name});
      if(a.length!==1)throw Error(`Ambiguous atom ${chain}:${resi}:${name}`);
      return a[0];
    };
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
    const focal=atoms.filter(a=>selected[a.chain]?.includes(a.resi));
    // Display only the local ribbon context within 11 Å; no remote domains obscure the interface.
    model.setStyle({},{});
    for(const [chain,color] of [['E','#4a8b80'],['I','#bf7564']]){
      const residues=[...new Set(atoms.filter(a=>a.chain===chain&&focal.some(b=>distance(a,b)<11)).map(a=>a.resi))];
      model.setStyle({chain,resi:residues},{cartoon:{color,opacity:.42,arrows:true,thickness:.18,style:'oval'}});
      model.setStyle({chain,resi:selected[chain]},{cartoon:{color,opacity:.5,arrows:true,thickness:.18,style:'oval'},stick:{radius:.16,colorscheme:{C:'#858c92',O:'#d64a4b',N:'#426aba',S:'#e7ba42'}},sphere:{scale:.23,colorscheme:{C:'#858c92',O:'#d64a4b',N:'#426aba',S:'#e7ba42'}}});
    }
    const pairs = [
      {a:['I',24,'C'],b:['E',195,'OG'],role:'Reactive-site proximity'},
      {a:['I',26,'O'],b:['E',193,'N'],role:'Backbone separation'},
      {a:['I',27,'OD1'],b:['E',192,'O'],role:'Short O···O contact'},
    ].map(p=>({...p,start:xyz(atom(...p.a)),end:xyz(atom(...p.b)),distance_A:distance(atom(...p.a),atom(...p.b))}));
    for(const p of pairs)viewer.addLine({start:p.start,end:p.end,dashed:true,color:'#bc9338',linewidth:4});
    viewer.zoomTo({or:Object.entries(selected).map(([chain,resi])=>({chain,resi}))});
    const view=viewer.getView();
    viewer.setView([...view.slice(0,4),.6532814824,.6532814824,-.2705980501,.2705980501]).zoom(1.08);
    viewer.render();
    const bounds=document.querySelector('#viewer').getBoundingClientRect();
    const screen=a=>{const p=viewer.modelToScreen(a);return{x:p.x-bounds.left,y:p.y-bounds.top}};
    const records=[];
    for(const chain of ['I','E'])for(const resi of selected[chain]){
      const a=atom(chain,resi,'CA');
      records.push({chain,resi,resname:a.resn,anchor:screen(a)});
    }
    return {selected_residues:selected, pairs:pairs.map(p=>({...p,start_screen:screen(p.start),end_screen:screen(p.end)})),labels:records,view:viewer.getView(),canvas:{width,height},
      secondary_structure:model.selectedAtoms({atom:'CA'}).reduce((a,x)=>(a[x.ss]=(a[x.ss]||0)+1,a),{})};
  },{pdb,width,height});
  await page.waitForTimeout(1600);
  const uri=await page.evaluate(()=>window.closeupViewer.pngURI());
  await fs.writeFile(path.join(out,'docking-closeup-unlabelled.png'),Buffer.from(uri.split(',')[1],'base64'));
  // Screen-space annotation is separate from the 3-D molecular data and is deterministic.
  await page.evaluate(({data,width,height})=>{
    const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
    const svg=document.querySelector('#labels');
    const placed=[];
    const label=(text,x,y,anchor,color='#31454c',size=21)=>{
      const w=text.length*size*.56+22,h=size+14;
      let yy=y;
      while(placed.some(p=>Math.abs(p.x-x)<(p.w+w)/2&&Math.abs(p.y-yy)<(p.h+h)/2))yy+=h+4;
      placed.push({x,y:yy,w,h});
      return `<path d="M ${anchor.x} ${anchor.y} L ${x} ${yy}" fill="none" stroke="${color}" stroke-width="1.2" opacity=".62"/><rect x="${x-w/2}" y="${yy-h/2}" width="${w}" height="${h}" rx="5" fill="white" fill-opacity=".93"/><text x="${x}" y="${yy}" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="${size}" font-weight="600" fill="${color}">${esc(text)}</text>`;
    };
    let parts=data.pairs.map(p=>`<path d="M ${p.start_screen.x} ${p.start_screen.y} L ${p.end_screen.x} ${p.end_screen.y}" stroke="#a87c29" fill="none" stroke-width="2.6" stroke-dasharray="7 5"/>`);
    // Editorial label positions avoid occluding the molecular atoms; anchors remain exact C-alpha projections.
    const positions={'E:57':[230,355],'E:195':[590,180],'E:193':[1120,170],'E:192':[950,815],
      'I:24':[520,705],'I:25':[830,220],'I:26':[1330,330],'I:27':[1400,580]};
    for(const p of data.labels){
      const [x,y]=positions[`${p.chain}:${p.resi}`];
      parts.push(label(`${p.chain} · ${p.resname}${p.resi}`,x,y,p.anchor,p.chain==='I'?'#995b51':'#306e66',23));
    }
    const distances=[[585,490],[1210,715],[1380,445]];
    for(const [index,p] of data.pairs.entries()){
      const center={x:(p.start_screen.x+p.end_screen.x)/2,y:(p.start_screen.y+p.end_screen.y)/2};
      parts.push(label(p.distance_A.toFixed(2)+' Å',...distances[index],center,'#776025',25));
    }
    svg.innerHTML=parts.join('');
  },{data,width,height});
  await page.screenshot({path:path.join(out,'docking-interface-closeup.png'),fullPage:true});
  await page.pdf({path:path.join(out,'docking-interface-closeup.pdf'),printBackground:true,preferCSSPageSize:true});
  const overlay=await page.locator('#labels').innerHTML();
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3400" height="2440" viewBox="0 0 1700 1220"><rect width="1700" height="1220" fill="white"/>
  <g font-family="Arial,sans-serif" fill="#26373d"><text x="58" y="64" font-size="36" font-weight="700">A closer view of the predicted NE–Elafin interface</text><text x="58" y="100" font-size="19" fill="#65767b">Human neutrophil elastase · Elafin reactive loop | HDOCK original rank 29 · post-hoc geometric candidate</text></g>
  <image href="${uri}" x="0" y="128" width="1700" height="980"/><g transform="translate(0 128)">${overlay}</g>
  <g font-family="Arial,sans-serif" font-size="17" fill="#445e63"><text x="58" y="1095">NE · chain E (teal)    Elafin · chain I (coral)    C gray · O red · N blue · S yellow</text>
  <text x="58" y="1140" font-weight="600">Dashed segments report heavy-atom separations, not assigned hydrogen bonds. The 2.18 Å O···O contact is unusually short.</text>
  <text x="58" y="1170">Unrelaxed rigid-body prediction; mature Elafin / NE author numbering. No experimentally validated interface or affinity is implied.</text></g></svg>`;
  await fs.writeFile(path.join(out,'docking-interface-closeup.svg'),svg);
  data.input={path:'docking/human-ne-elafin/geometry-candidate.pdb',sha256:crypto.createHash('sha256').update(pdb).digest('hex'),original_HDOCK_rank:29};
  data.interpretation='Post-hoc geometric candidate, not a validated inhibitory complex. Distances are geometric atom separations, not assigned hydrogen bonds. The 2.18 A O-O contact requires relaxation/assessment.';
  data.rendering={software:'3Dmol.js 2.5.5',source:'Deposited source monomer secondary-structure records transferred without changing coordinates; local ribbon context within 11 A of selected atoms.',atoms:'Carbon gray, oxygen red, nitrogen blue, sulfur yellow.',labels:'Separate SVG screen-space annotations.'};
  const png=await fs.readFile(path.join(out,'docking-interface-closeup.png'));
  data.width=png.readUInt32BE(16);data.height=png.readUInt32BE(20);
  data.actualwidth=data.width;data.actualheight=data.height;
  data.files={png:'docking-interface-closeup.png',svg:'docking-interface-closeup.svg',pdf:'docking-interface-closeup.pdf',contacts:'closeup-contacts.csv',script:'render_docking_closeup.mjs'};
  await fs.writeFile(path.join(out,'docking-closeup-data.json'),JSON.stringify(data,null,2));
  await fs.writeFile(path.join(out,'closeup-metadata.json'),JSON.stringify(data,null,2));
  await fs.writeFile(path.join(out,'closeup-contacts.csv'),'chain_1,residue_1,atom_1,chain_2,residue_2,atom_2,distance_A,interpretation\n'+data.pairs.map(p=>[...p.a,...p.b,p.distance_A,p.role].join(',')).join('\n')+'\n');
  await fs.copyFile(fileURLToPath(import.meta.url),path.join(out,'render_docking_closeup.mjs'));
  console.log(JSON.stringify({output:'docking-interface-closeup.png',pairs:data.pairs.map(({a,b,distance_A})=>({a,b,distance_A}))}));
}finally{await browser.close();}
