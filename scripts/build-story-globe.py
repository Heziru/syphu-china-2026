from pathlib import Path
import json, re, xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parents[1]
src=ROOT/'outputs/story-sources'
out=ROOT/'public/assets/cosmic'
x=E.parse(src/'gbd-2019.xml')
rows=x.findall(".//table-wrap[@id='T1']//tbody/tr")
regions={}
for row in rows:
    cells=[''.join(c.itertext()).strip() for c in row]
    if len(cells)>3 and re.match(r'\d',cells[1]):
        regions[cells[0]]={'1990':float(cells[1].split()[0]),'2019':float(cells[2].split()[0]),'ui1990':cells[1], 'ui2019':cells[2]}
groups={
'High-income North America':'USA CAN GRL',
'Western Europe':'GBR IRL FRA DEU ESP PRT ITA AUT CHE BEL NLD LUX DNK SWE NOR FIN ISL GRC CYP MLT AND MCO SMR ISR',
'Central Europe':'POL CZE SVK HUN SVN HRV BIH SRB MNE MKD ALB ROU BGR XKX',
'Eastern Europe':'RUS UKR BLR EST LVA LTU MDA',
'Central Asia':'ARM AZE GEO KAZ KGZ TJK TKM UZB MNG',
'East Asia':'CHN TWN PRK',
'High-income Asia Pacific':'JPN KOR SGP BRN',
'Australasia':'AUS NZL',
'South Asia':'IND PAK BGD NPL BTN',
'Southeast Asia':'IDN MYS THA VNM KHM LAO MMR PHL LKA MDV TLS MUS SYC',
'Oceania':'PNG FJI SLB VUT WSM TON KIR FSM MHL PLW TUV NRU ASM GUM MNP',
'North Africa and Middle East':'MAR DZA TUN LBY EGY SDN TUR IRN IRQ SYR LBN JOR PSE SAU YEM OMN ARE QAT BHR KWT AFG',
'Andean Latin America':'BOL ECU PER',
'Central Latin America':'MEX GTM HND SLV NIC CRI PAN COL VEN',
'Tropical Latin America':'BRA PRY',
'Southern Latin America':'ARG CHL URY',
'Caribbean':'CUB HTI DOM JAM PRI TTO GUY SUR BHS BRB LCA VCT GRD ATG DMA KNA BMU BLZ VIR',
'Central sub-Saharan Africa':'AGO CAF COD COG GNQ GAB',
'Eastern sub-Saharan Africa':'BDI COM DJI ERI ETH KEN MDG MWI MOZ RWA SOM SSD TZA UGA ZMB',
'Southern sub-Saharan Africa':'BWA LSO NAM ZAF SWZ ZWE',
'Western sub-Saharan Africa':'BEN BFA CMR CPV TCD CIV GMB GHA GIN GNB LBR MLI MRT NER NGA STP SEN SLE TGO'}
mapping={c:r for r,cs in groups.items() for c in cs.split()}
# Natural Earth administrative codes which differ from ISO / GBD country codes.
mapping.update({'SDS':mapping['SSD'],'PSX':mapping['PSE']})
geo=json.loads((src/'countries.geojson').read_text())
features=[]
for f in geo['features']:
    p=f['properties']; iso=p['ADM0_A3']; g=f['geometry']
    polygons=[g['coordinates']] if g['type']=='Polygon' else g['coordinates']
    kept=[]
    for poly in polygons:
        rings=[]
        for ring in poly:
            rr=[ring[0]]
            for q in ring[1:-1]:
                if abs(q[0]-rr[-1][0])+abs(q[1]-rr[-1][1])>.12:rr.append(q)
            rr.append(ring[-1])
            if len(rr)>3:rings.append([[round(a,3),round(b,3)] for a,b in rr])
        if rings:kept.append(rings)
    features.append({'name':p['ADMIN'],'iso':iso,'region':mapping.get(iso),'polygons':kept})
payload={'source':'https://doi.org/10.1136/bmjopen-2022-065186','metric':'Age-standardised prevalence per 100,000 people','resolution':'GBD regions; country outlines are geographic context, not country estimates','years':[1990,2019],'regions':{k:regions[k] for k in groups},'features':features}
(out/'ibd-regions.json').write_text(json.dumps(payload,separators=(',',':')),encoding='utf-8')
print(len(features),'geographies',len(groups),'GBD regions')
