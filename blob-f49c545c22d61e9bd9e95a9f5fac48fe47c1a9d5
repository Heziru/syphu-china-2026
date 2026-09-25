"""Read the supplied roster without modifying it; build reviewed web derivatives.

Usage: python scripts/prepare-team-assets.py path/to/roster.xlsx
Only columns A:M are used. Contact details are deliberately not exported.
"""
import io
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "s": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}
NAMES = ['Ziru He', 'Longqing Wang', 'Yijin Zhao', 'Dingyi Feng', 'Hao Lin',
         'Yingtingxi Zhao', 'Yu Yan', 'Zihan Liu', 'Xiangjie Kong', 'Jiaying Li',
         'Zijun Meng', 'Yanyu Qiu', 'Shaojiang Xue', 'Junheng Zhang', 'Wenzhen Qian',
         'Zixuan Cao', 'Zheng Shi', 'Tianhao Wu', 'Jingyuan Zhang', 'Kunwei Xie',
         'Jiayi Xu', 'Sirui Wang', 'Xinzhu Ding', 'Haibo Xu', 'Yize Yang']
# Explicit visual review of the workbook's twelve embedded portraits.
# Focal points are CSS object-position percentages; originals remain untouched.
FOCAL = {2: (65, 48), 4: (59, 46), 5: (50, 46), 6: (66, 45), 8: (59, 45),
         9: (70, 42), 10: (29, 44), 15: (50, 45), 17: (32, 43),
         20: (50, 60), 21: (50, 40), 24: (50, 48)}
CONTRIBUTIONS = {
 2: 'Coordinates the team and project, and leads Wiki planning, design, content integration and development.',
 4: 'Leads visual design across posters, the Wiki and presentation materials, coordinating a consistent visual identity.',
 5: 'Laboratory experiments and plasmid design.',
 6: 'Laboratory experiments, experimental design and primer design.',
 8: 'Creates visual designs informed by the experimental work.',
 9: 'Leads Human Practices: outreach, public surveys, community conversations and inter-team exchanges. Connects stakeholder feedback with experimental design.',
 10: 'Laboratory experiments and primer design.', 15: 'Organizes laboratory experiments.',
 17: 'Laboratory experiments.', 19: 'Laboratory experiments.',
 21: 'Laboratory experiments and plasmid construction.',
 23: 'Creates outreach posters and contributes to the design of Wiki presentation panels.'}
TRANSLATIONS = {
 '生物制药': 'Biopharmaceutical Sciences',
 '生物制药（生命基地班）': 'Biopharmaceutical Sciences (Life Sciences Program)',
 '药学（日语强化班）': 'Pharmacy (Japanese Program)',
 '药学（英语强化班）': 'Pharmacy (English Program)',
 '药学（英语强化班': 'Pharmacy (English Program)',
 '药物制剂': 'Pharmaceutical Preparations', '药物分析': 'Pharmaceutical Analysis',
 '中药学': 'Chinese Materia Medica', '动物医学': 'Veterinary Medicine',
 '生命科学与生物制药学院': 'School of Life Sciences and Biopharmaceutics',
 '药学院': 'School of Pharmacy', '中药学院': 'School of Traditional Chinese Materia Medica',
 '吉林大学动物医学学院': 'College of Veterinary Medicine, Jilin University'}
FACTS = {
 2: 'I never know how much I can write until the Wiki deadline.',
 4: 'Sea lions are incredibly cute.',
 6: 'Sometimes, the only way to know is to try.',
 8: 'I find happiness in becoming a little better every day.',
 10: 'Even a tiny moss flower blooms like a peony.'}
MOTTOS = {
 2: 'Record life through code. Understand the world through curiosity.',
 4: 'Freedom. Life. Love.', 5: 'Let everything be as it is.',
 6: 'Remove what does not work; discover what matters.',
 8: 'Upward, not northward.',
 9: 'Life is precious, love more so; for freedom, I would give up both.',
 10: 'We are made of stardust.', 17: 'Seek the truth, even if it may not exist.'}

def clean(s):
    return s.replace('，', ', ').replace('—  ', '— ').strip().rstrip(',')

def make_web_image(im, name, folder):
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.thumbnail((1200, 1500), Image.Resampling.LANCZOS)
    im.save(folder / f'{name}.webp', 'WEBP', quality=86, method=6)
    im.thumbnail((480, 600), Image.Resampling.LANCZOS)
    im.save(folder / f'{name}-small.webp', 'WEBP', quality=80, method=6)

def main(source):
    z = zipfile.ZipFile(source)
    strings = [''.join(e.itertext()) for e in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    cells = {}
    for cell in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//m:c', NS):
        if cell.get('r', '').startswith('N'):
            continue
        v = cell.find('m:v', NS)
        if v is not None:
            cells[cell.get('r')] = strings[int(v.text)] if cell.get('t') == 's' else v.text
    assert cells['B1'] == '英文姓名 / 展示名' and cells['C1'] == '个人照片'
    assert cells['C28'] == '湿实验' and cells['L28'] == 'Wiki'
    styles = ET.fromstring(z.read('xl/styles.xml')).find('m:cellXfs', NS)
    yellow = []
    for cell in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//m:c', NS):
        if styles[int(cell.get('s', 0))].get('fillId') == '2' and cell.get('r') in cells:
            yellow.append(cell.get('r'))
    assert set(yellow) == {'D30', 'E30', 'G30'}, 'Advisor highlights changed: review before exporting.'
    group_cells = {'wet': ['D29', *[f'{c}{r}' for r in range(31,34) for c in 'CDE'], 'E34'],
                   'dry': ['G29','F31','G31','F32','G32','F35'],
                   'art': ['I29','H30','I30'], 'hp':['K29','J30','K30','J31'], 'wiki':['B29']}
    assignments = {cells[c]: g for g, cs in group_cells.items() for c in cs if cells.get(c)}
    images = {}
    rels = {e.get('Id'): 'xl/drawings/'+e.get('Target') for e in ET.fromstring(z.read('xl/drawings/_rels/drawing1.xml.rels'))}
    folder = ROOT / 'public/assets/team'; folder.mkdir(parents=True, exist_ok=True)
    for anchor in ET.fromstring(z.read('xl/drawings/drawing1.xml')):
        row = int(anchor.find('s:from/s:row', NS).text)+1
        target = rels[anchor.find('.//a:blip', NS).get('{'+NS['r']+'}embed')]
        name = f'member-{row-1:02}'
        make_web_image(Image.open(io.BytesIO(z.read(target))), name, folder)
        images[row] = name
    leaders = {2:'Team Leader',4:'Art & Design Lead',9:'Human Practices Lead',14:'Dry Lab Lead',15:'Wet Lab Lead'}
    members = []
    for row in range(2,27):
        def value(col): return cells.get(f'{col}{row}', '')
        name = value('B') or NAMES[row-2]
        member = {'id':f'member-{row-1:02}', 'name':name, 'number':f'{row-1:02}',
            'kind':'student', 'role':leaders.get(row,'Team Member'), 'groups':[assignments[value('A')]],
            'photo':images.get(row,''), 'focal':list(FOCAL.get(row,(50,50))),
            'bio':clean(value('J')), 'contribution':CONTRIBUTIONS.get(row,''),
            'major':TRANSLATIONS.get(value('G'),value('G')), 'cohort':value('H').replace('级',''),
            'school':TRANSLATIONS.get(value('I'),value('I')),
            'interests':clean(value('K')), 'funFact':FACTS.get(row,clean(value('L'))),
            'motto':MOTTOS.get(row,clean(value('M')))}
        members.append(member)
    advisors = []
    for i,(cell,name,group) in enumerate([('D30','Lirong Zhang','wet'),('E30','Yixin Liu','wet'),('G30','Haibo Li','dry')]):
        advisors.append({'id':f'advisor-{i+1}', 'name':name, 'number':f'A{i+1}', 'kind':'advisor',
            'role':'Advisor','groups':[group], 'photo':'','focal':[50,50], 'bio':'','contribution':'',
            'major':'','cohort':'','school':'','interests':'','funFact':'','motto':''})
    pi = dict(advisors[0],id='pi',name='',number='PI',kind='pi',role='Principal Investigator',groups=[])
    for p in (ROOT/'docs/references/photos').glob('*.jpg'):
        im=ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        im.thumbnail((1920,1600),Image.Resampling.LANCZOS)
        im.save(folder/f'{p.stem.lower()}.webp','WEBP',quality=88,method=6)
    path=ROOT/'src/contents/team';path.mkdir(parents=True,exist_ok=True)
    (path/'teamRoster.json').write_text(json.dumps({'members':members,'advisors':advisors,'pi':pi},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'{len(members)} students, {len(advisors)} advisors, one PI placeholder; {len(images)} portraits.')

if __name__ == '__main__':
    main(sys.argv[1])
