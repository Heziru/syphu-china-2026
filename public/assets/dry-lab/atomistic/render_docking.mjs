// True coordinate renders of computed HDOCK poses using the pinned local 3Dmol renderer.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchReviewBrowser } from '../../browser-review.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'public/assets/dry-lab/atomistic');
const summary = JSON.parse(await fs.readFile(path.join(out, 'docking-summary.json'), 'utf8'));
const native = await fs.readFile(path.join(root, 'public/assets/dry-lab/structures/1fle.pdb'), 'utf8');
const poses = {};
for (const name of ['1fle-redocking', 'human-ne-elafin']) {
  poses[name] = await fs.readFile(path.join(out, 'docking', name, 'top1-cartoon.pdb'), 'utf8');
}
poses.candidate = await fs.readFile(path.join(out, 'docking/human-ne-elafin/geometry-candidate.pdb'), 'utf8');
const browser = await launchReviewBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 2 });
  await page.setContent('<!doctype html><html><body style="margin:0;background:white"><div id="viewer" style="width:1200px;height:1000px;position:relative"></div></body></html>');
  await page.addScriptTag({ path: path.join(root, 'public/assets/dry-lab/vendor/3Dmol-2.5.5.min.js') });
  const metadata = [];
  for (const mode of ['redocking-overlay', 'redocking-interface', 'human-ne-complex', 'human-ne-interface', 'candidate-complex', 'candidate-interface']) {
    const data = await page.evaluate(({ mode, native, poses, summary }) => {
      const el = document.querySelector('#viewer'); el.replaceChildren();
      const viewer = window.$3Dmol.createViewer(el, { backgroundColor: 'white', antialias: true });
      window.atomisticViewer = viewer;
      const teal = '#388c87', coral = '#d77662', gold = '#b39547';
      const cartoon = (color) => ({ arrows: true, thickness: .28, style: 'oval', color });
      const redocking = mode.startsWith('redocking');
      const name = redocking ? '1fle-redocking' : 'human-ne-elafin';
      const candidate = mode.startsWith('candidate');
      const model = viewer.addModel(candidate ? poses.candidate : poses[name], 'pdb', { noComputeSecondaryStructure: true });
      model.setStyle({}, {});
      model.setStyle({ chain: 'E' }, { cartoon: cartoon(teal) });
      model.setStyle({ chain: 'I' }, { cartoon: cartoon(coral) });
      if (mode === 'redocking-overlay') {
        const reference = viewer.addModel(native, 'pdb', { noComputeSecondaryStructure: true });
        reference.setStyle({}, {});
        reference.setStyle({ chain: 'I', hetflag: false }, { cartoon: cartoon(gold) });
      }
      let annotations = [];
      if (mode.endsWith('interface')) {
        // Render three actual closest contacts; labels remain separate vector text in the figure.
        const contacts = candidate ? summary.cases[name].posthoc_geometry_screen.contacts_under_4A : summary.cases[name].top1_contacts_under_4A;
        const selected = [];
        const used = new Set();
        for (const c of contacts) {
          if (used.has(c.I_residue) || used.has('E' + c.E_residue)) continue;
          selected.push(c); used.add(c.I_residue); used.add('E' + c.E_residue);
          if (selected.length === 3) break;
        }
        const ires = selected.map(c => Number(c.I_residue));
        const eres = selected.map(c => Number(c.E_residue));
        model.setStyle({}, {});
        const color = C => ({ C, O: '#cc4c4c', N: '#506cb8', S: '#d9ac3e' });
        for (const [chain, resi, carbon] of [['E', eres, teal], ['I', ires, coral]]) {
          model.setStyle({ chain, resi }, { stick: { radius: .15, colorscheme: color(carbon) }, sphere: { scale: .26, colorscheme: color(carbon) } });
        }
        for (const c of selected) {
          const p = xyz => ({ x: xyz[0], y: xyz[1], z: xyz[2] });
          viewer.addLine({ start: p(c.I_xyz), end: p(c.E_xyz), dashed: true, color: '#43565a', linewidth: 3 });
        }
        viewer.zoomTo({ or: [{ chain: 'I', resi: ires }, { chain: 'E', resi: eres }] }).rotate(25, 'y').rotate(-8, 'z').zoom(.88);
        viewer.render();
        annotations = selected.map(c => ({ ...c,
          start: viewer.modelToScreen({ x: c.I_xyz[0], y: c.I_xyz[1], z: c.I_xyz[2] }),
          end: viewer.modelToScreen({ x: c.E_xyz[0], y: c.E_xyz[1], z: c.E_xyz[2] }),
          I_CA: viewer.modelToScreen(model.selectedAtoms({ chain: 'I', resi: Number(c.I_residue), atom: 'CA' })[0]),
          E_CA: viewer.modelToScreen(model.selectedAtoms({ chain: 'E', resi: Number(c.E_residue), atom: 'CA' })[0]),
        }));
      } else {
        viewer.zoomTo({ hetflag: false }).rotate(-12, 'y').rotate(12, 'z').zoom(1.05);
        viewer.render();
      }
      return { mode, annotations, view: viewer.getView(), atoms: model.selectedAtoms({}).length,
        secondary_structure: model.selectedAtoms({atom:'CA'}).reduce((a,x)=>(a[x.ss]=(a[x.ss]||0)+1,a),{}) };
    }, { mode, native, poses, summary });
    await page.waitForTimeout(1400);
    const uri = await page.evaluate(() => window.atomisticViewer.pngURI());
    await fs.writeFile(path.join(out, mode + '.png'), Buffer.from(uri.split(',')[1], 'base64'));
    metadata.push(data);
  }
  await fs.writeFile(path.join(out, 'docking-render-metadata.json'), JSON.stringify(metadata, null, 2));
  console.log('Rendered six genuine docking coordinate views.');
} finally { await browser.close(); }
