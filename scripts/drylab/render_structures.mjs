// Reproducible local 3Dmol.js 2.5.5 coordinate rendering; never image generation.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { launchReviewBrowser } from '../browser-review.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'public/assets/dry-lab/research');
const work = path.join(root, 'outputs/dry-lab-research');
const vendor = path.join(root, 'public/assets/dry-lab/vendor/3Dmol-2.5.5.min.js');
const pdb = await fs.readFile(path.join(root, 'public/assets/dry-lab/structures/1fle.pdb'), 'utf8');
const nmr = await fs.readFile(path.join(work, '2rel-wap-aligned.pdb'), 'utf8');
const summary = JSON.parse(await fs.readFile(path.join(out, 'structure-summary.json'), 'utf8'));
const browser = await launchReviewBrowser();
try {
 const page = await browser.newPage({viewport:{width:1200,height:1000}, deviceScaleFactor:2});
 await page.setContent('<!doctype html><html><body style="margin:0;background:white"><div id="viewer" style="width:1200px;height:1000px;position:relative"></div></body></html>');
 await page.addScriptTag({path:vendor});
 const metadata = [];
 for(const mode of ['complex', 'interface', 'ensemble', 'monomer']) {
  const result = await page.evaluate(({pdb,nmr,mode,contacts}) => {
   const container=document.querySelector('#viewer');container.replaceChildren();
   const viewer=window.$3Dmol.createViewer(container,{backgroundColor:'white',antialias:true});
   window.structureViewer=viewer;
   const teal='#388c87',coral='#d77662';
   const standard={arrows:true,thickness:.32,style:'oval'};
   if(mode==='complex'||mode==='interface') {
    const model=viewer.addModel(pdb,'pdb',{noComputeSecondaryStructure:true});
    viewer.setStyle({},{});
    viewer.setStyle({chain:'E',hetflag:false},{cartoon:{...standard,color:teal}});
    viewer.setStyle({chain:'I',hetflag:false},{cartoon:{...standard,color:coral}});
    viewer.setStyle({hetflag:true},{});
    if(mode==='interface') {
     // Reactive-site local environment; bonds inferred by 3Dmol from real atom geometry.
     viewer.setStyle({},{});
     const es=[193,216];const is=[22,24];
     const color=(carbon)=>({C:carbon,O:'#cc4c4c',N:'#506cb8',S:'#d9ac3e'});
     viewer.setStyle({chain:'E',resi:es,hetflag:false},{stick:{radius:.15,colorscheme:color(teal)},sphere:{scale:.26,colorscheme:color(teal)}});
     viewer.setStyle({chain:'I',resi:is,hetflag:false},{stick:{radius:.15,colorscheme:color(coral)},sphere:{scale:.26,colorscheme:color(coral)}});
     const shown=contacts.filter(c=>(c.I_residue==='24'&&c.E_residue==='193')||(c.I_residue==='22'&&c.E_residue==='216'));
     for(const c of shown){
      const p=(a)=>({x:a[0],y:a[1],z:a[2]});
      viewer.addLine({start:p(c.I_xyz),end:p(c.E_xyz),dashed:true,color:'#222f33',linewidth:3});
     }
     viewer.zoomTo({or:[{chain:'E',resi:es},{chain:'I',resi:is}]}).rotate(30,'y').rotate(-15,'z').zoom(.86);
    } else {
     viewer.zoomTo({hetflag:false}).rotate(-15,'y').rotate(15,'z').zoom(1.02);
    }
    const ca=model.selectedAtoms({atom:'CA',hetflag:false});
    viewer.render();
    const annotations=mode==='interface'?{
     residues:[['I',24],['I',22],['E',193],['E',216]].map(([chain,resi])=>({chain,resi,screen:viewer.modelToScreen(model.selectedAtoms({chain,resi,atom:'CA'})[0])})),
     distances:contacts.filter(c=>(c.I_residue==='24'&&c.E_residue==='193')||(c.I_residue==='22'&&c.E_residue==='216')).map(c=>({distance_A:c.distance_A,I_residue:c.I_residue,E_residue:c.E_residue,start:viewer.modelToScreen({x:c.I_xyz[0],y:c.I_xyz[1],z:c.I_xyz[2]}),end:viewer.modelToScreen({x:c.E_xyz[0],y:c.E_xyz[1],z:c.E_xyz[2]})}))
    }:null;
    return {mode,CA_count:ca.length,secondary_structure_CA:ca.reduce((a,x)=>(a[x.ss]=(a[x.ss]||0)+1,a),{}),view:viewer.getView(),annotations};
   }
   const blocks=nmr.split(/MODEL\s+\d+\s*\n/).slice(1).map(block=>block.split('ENDMDL')[0]);
   const header=nmr.split(/MODEL\s+\d+\s*\n/)[0];
   for(let index=0;index<(mode==='ensemble'?blocks.length:1);index++) {
    const model=viewer.addModel(header+blocks[index],'pdb',{noComputeSecondaryStructure:true});
    model.setStyle({},{cartoon:{...standard,style:mode==='ensemble'?'trace':'oval',color:mode==='ensemble'?'#4e9d94':coral,opacity:1,thickness:mode==='ensemble'?.13:.32}});
    model.setStyle({resi:[1,2,3,4,5,6,7,8]},{cartoon:{...standard,style:mode==='ensemble'?'trace':'oval',color:'#d9a24e',opacity:1,thickness:mode==='ensemble'?.13:.32}});
    model.setStyle({elem:'H'},{});
   }
   viewer.zoomTo().rotate(5,'x').rotate(-25,'y').rotate(15,'z').zoom(1.03);
   viewer.render();return {mode,models:mode==='ensemble'?blocks.length:1,alignment:'2REL C-alpha WAP mature9–57; generalized Procrustes',view:viewer.getView()};
  },{pdb,nmr,mode,contacts:summary.complex.contacts_under_4A});
  await page.waitForTimeout(1200);
  const data=await page.evaluate(()=>window.structureViewer.pngURI());
  const name={complex:'1fle-cartoon',interface:'1fle-interface-detail',ensemble:'2rel-aligned-ensemble',monomer:'2rel-cartoon'}[mode];
  await fs.writeFile(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  metadata.push({...result,file:name+'.png'});
 }
 const provenance={library:'3Dmol.js',version:'2.5.5',url:'https://cdn.jsdelivr.net/npm/3dmol@2.5.5/build/3Dmol-min.js',sha256:crypto.createHash('sha256').update(await fs.readFile(vendor)).digest('hex'),license:'MIT; see public/assets/dry-lab/vendor/3Dmol-LICENSE.txt and bundled LICENSE.txt',secondaryStructure:'PDB HELIX/SHEET records, noComputeSecondaryStructure:true; no manual secondary-structure assignment',rendering:metadata};
 await fs.writeFile(path.join(work,'render-provenance.json'),JSON.stringify(provenance,null,2));
 await fs.writeFile(path.join(root,'public/assets/dry-lab/vendor/provenance.json'),JSON.stringify(provenance,null,2));
 console.log(JSON.stringify(metadata,null,2));
} finally {await browser.close();}
