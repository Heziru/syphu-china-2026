"""Fetch public geographic/source data; write only inside this repository."""
from pathlib import Path
import urllib.request, json, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'SYPHU-China wiki research'}),timeout=45).read()

out=ROOT/'outputs/story-sources'
out.mkdir(parents=True,exist_ok=True)
xml=fetch('https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10069527/fullTextXML')
(out/'gbd-2019.xml').write_bytes(xml)
x=ET.fromstring(xml)
for t in x.findall('.//table-wrap'):
    print('TABLE',t.attrib.get('id'))
    print(' '.join(t.itertext())[:16000])
for el in x.findall('.//supplementary-material'):
    print('SUPPLEMENT',ET.tostring(el,encoding='unicode')[:2000])
geo=fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
(out/'countries.geojson').write_bytes(geo)
print('GEOGRAPHY_BYTES',len(geo))
