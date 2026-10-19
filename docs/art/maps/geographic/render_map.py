"""Render a north-up map from unmodified OSM coordinates, with game-specific ink colors.

No generated geometry, displacement filter, invented rooftops or image-to-image step.
Python stdlib only; PNG export uses the bundled sharp runtime separately.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import math
import json
import hashlib
import base64
from collections import Counter

ROOT = Path(__file__).resolve().parent
W, H = 2400, 1600
R = 6378137.0
WEST, EAST, NORTH = 139.686, 139.705, 35.6983
def merc(lon, lat):
    return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
X0, Y1 = merc(WEST, NORTH)
X1, _ = merc(EAST, NORTH)
M = (X1 - X0) / W
Y0 = Y1 - M * H
SOUTH = math.degrees(2 * math.atan(math.exp(Y0 / R)) - math.pi / 2)
def xy(lon, lat):
    x, y = merc(lon, lat)
    return ((x-X0)/M, (Y1-y)/M)
def tags(el):
    return {t.attrib['k']: t.attrib['v'] for t in el.findall('tag')}
nodes, ways, relations = {}, {}, {}
sources = []
for p in sorted(ROOT.glob('osm-*.xml')):
    data = p.read_bytes()
    sources.append({'file':p.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    root = ET.fromstring(data)
    nodes.update({n.attrib['id']: n for n in root.findall('node')})
    ways.update({w.attrib['id']: w for w in root.findall('way')})
    relations.update({r.attrib['id']:r for r in root.findall('relation')})
points = {i:xy(float(n.attrib['lon']),float(n.attrib['lat'])) for i,n in nodes.items()}
def refs(w):
    return [n.attrib['ref'] for n in w.findall('nd')]
def geometry(rr):
    return [points[i] for i in rr if i in points]
def visible(pp):
    return bool(pp) and max(p[0] for p in pp)>=0 and min(p[0] for p in pp)<=W and max(p[1] for p in pp)>=0 and min(p[1] for p in pp)<=H
def path(pp, close=False):
    return 'M'+'L'.join(f'{x:.3f},{y:.3f}' for x,y in pp)+('Z' if close else '')
def poly_area(pp):
    return abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(pp,pp[1:]+pp[:1]))/2)
def join_rings(parts):
    parts=[p[:] for p in parts if p]
    rings=[]
    while parts:
        chain=parts.pop(0)
        while chain[-1]!=chain[0]:
            match=None
            for i,p in enumerate(parts):
                if p[0]==chain[-1]: match=(i,p);break
                if p[-1]==chain[-1]:match=(i,p[::-1]);break
            if match is None:break
            i,p=match;chain.extend(p[1:]);parts.pop(i)
        if len(chain)>3 and chain[0]==chain[-1]:rings.append(chain)
    return rings

svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
 '<title>西新宿・新宿駅西側 実地理に基づく地図素材（北上）</title>',
 '<desc>Map data © OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright. Geographic coordinates are projected without geometric stylization. Surface layers only; indoor and underground paths omitted.</desc>',
 '''<defs>
 <pattern id="roofHatch" width="19" height="19" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 0V12M3 8V19" stroke="#d0c2a7" stroke-width=".65" opacity=".12"/></pattern>
 <pattern id="groundHatch" width="29" height="29" patternUnits="userSpaceOnUse" patternTransform="rotate(21)"><path d="M0 0V29" stroke="#d0c2a7" stroke-width=".5" opacity=".055"/></pattern>
 <filter id="pigment" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".58" numOctaves="3" seed="19"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".075"/></feComponentTransfer></filter>
 <clipPath id="viewport"><rect width="2400" height="1600"/></clipPath>
 </defs>''',
 f'<rect width="{W}" height="{H}" fill="#333b3e"/>',
 f'<rect width="{W}" height="{H}" fill="url(#groundHatch)"/>',
 '<g clip-path="url(#viewport)">']
counts=Counter()
def area_color(t):
    if t.get('natural') in ('water','wetland') or t.get('waterway')=='riverbank':return '#3a5358'
    if t.get('leisure') in ('park','garden','pitch') or t.get('landuse') in ('grass','forest','meadow') or t.get('natural') in ('wood','scrub','grassland'):return '#4a5142'
    if t.get('landuse')=='railway':return '#272e32'
    if t.get('amenity')=='parking':return '#41494b'
    return None
# OSM polygon outlines and multipolygon holes are preserved.
for w in ways.values():
    rr=refs(w);pp=geometry(rr);c=area_color(tags(w))
    if c and len(rr)>3 and rr[0]==rr[-1] and len(pp)==len(rr) and visible(pp):
        svg.append(f'<path d="{path(pp,True)}" fill="{c}" stroke="#2a3335" stroke-width="1"/>');counts['land_polygons']+=1
for r in relations.values():
    t=tags(r);c=area_color(t)
    if not c or t.get('type')!='multipolygon':continue
    outer=[];inner=[]
    for m in r.findall('member'):
        if m.attrib['type']=='way' and m.attrib['ref'] in ways:
            (inner if m.attrib.get('role')=='inner' else outer).append(refs(ways[m.attrib['ref']]))
    polygons=[geometry(rr) for rr in join_rings(outer)+join_rings(inner)]
    if polygons and any(visible(pp) for pp in polygons):
        d=' '.join(path(pp,True) for pp in polygons)
        svg.append(f'<path d="{d}" fill="{c}" fill-rule="evenodd" stroke="#2a3335" stroke-width="1"/>');counts['land_relations']+=1

buildings=[]
for i,w in ways.items():
    t=tags(w);rr=refs(w);pp=geometry(rr)
    if t.get('building') not in (None,'no') and len(rr)>3 and rr[0]==rr[-1] and len(pp)==len(rr) and visible(pp):
        buildings.append((i,t,pp))
for i,t,pp in sorted(buildings,key=lambda b:-poly_area(b[2])):
    d=path(pp,True);a=poly_area(pp)
    choices=['#62686a','#626465','#5b6468','#6b6e6b','#596369','#70716b','#5e6464']
    color=choices[int(i)%len(choices)]
    if t.get('amenity')=='place_of_worship':color='#746b5c'
    svg.append(f'<path d="{d}" fill="#20272b" transform="translate(1.7,2.2)"/>')
    svg.append(f'<path data-osm-way="{i}" d="{d}" fill="{color}" stroke="#1e282d" stroke-width="1.25" stroke-linejoin="round"/>')
    if a>24:
        svg.append(f'<path d="{d}" fill="url(#roofHatch)" stroke="#b6b09e" stroke-opacity=".28" stroke-width=".43"/>')
    counts['buildings']+=1

road_widths={'motorway':9,'motorway_link':5,'trunk':9,'trunk_link':5,'primary':8,'primary_link':5,'secondary':7,'secondary_link':4.5,'tertiary':7,'tertiary_link':4,'residential':5,'unclassified':5,'living_street':4.5,'service':3.5,'pedestrian':4,'footway':1.5,'path':1.3,'steps':1.5,'cycleway':2.0}
roads=[];rails=[]
for i,w in ways.items():
    t=tags(w);pp=geometry(refs(w))
    if not visible(pp) or len(pp)<2:continue
    # Exclude indoor circulation, subterranean roads and railway, planned construction.
    if t.get('indoor') not in (None,'no') or t.get('tunnel') in ('yes','building_passage') or t.get('location')=='underground':continue
    if t.get('level') not in (None,'0','0.0'):continue
    try:layer=float(t.get('layer','0'))
    except ValueError:layer=0
    if layer<0:continue
    if t.get('highway') in road_widths:
        width=road_widths[t['highway']]
        if t['highway'] not in ('footway','steps','path','cycleway'):
            try:width=max(2,min(float(t.get('width','').split()[0]),28))
            except (ValueError,IndexError):
                try:width=max(width,min(float(t.get('lanes','1'))*3.0,20))
                except ValueError:pass
        roads.append((layer,i,t,pp,width/M))
    if t.get('railway') in ('rail','light_rail','narrow_gauge'):
        rails.append((layer,i,t,pp))
for level in sorted({r[0] for r in roads}|{r[0] for r in rails}):
    for _,i,t,pp,width in [r for r in roads if r[0]==level]:
        walk=t['highway'] in ('footway','path','steps','cycleway');d=path(pp)
        svg.append(f'<path d="{d}" fill="none" stroke="#20292d" stroke-width="{width+2.2:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
    for _,i,t,pp,width in [r for r in roads if r[0]==level]:
        walk=t['highway'] in ('footway','path','steps','cycleway');d=path(pp)
        color='#807c6f' if walk else '#b0a58e'
        svg.append(f'<path data-osm-way="{i}" d="{d}" fill="none" stroke="{color}" stroke-width="{width:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
        if not walk and width>8:
            svg.append(f'<path d="{d}" fill="none" stroke="#dbceb0" stroke-opacity=".3" stroke-width=".8"/>')
        counts['surface_roads']+=1
    for _,i,t,pp in [r for r in rails if r[0]==level]:
        d=path(pp)
        svg.append(f'<path d="{d}" fill="none" stroke="#242b2e" stroke-width="4.7"/>')
        svg.append(f'<path data-osm-way="{i}" d="{d}" fill="none" stroke="#aca28e" stroke-width="1.5"/>')
        svg.append(f'<path d="{d}" fill="none" stroke="#313b40" stroke-width="3.4" stroke-dasharray=".9 5"/>')
        counts['surface_railways']+=1

# Small, existing OSM tree points only; never scatter fabricated trees.
for i,n in nodes.items():
    t=tags(n)
    if t.get('natural')=='tree':
        x,y=points[i]
        if 0<x<W and 0<y<H:
            svg.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.6" fill="#62644c" stroke="#313c35" stroke-width=".6"/>');counts['mapped_trees']+=1
svg.append('</g>')
# Handpainted pigment texture changes color only; no coordinate or outline is moved.
texture = ROOT / 'pigment-texture.png'
if texture.exists():
    b64=base64.b64encode(texture.read_bytes()).decode('ascii')
    svg.append(f'<image href="data:image/png;base64,{b64}" width="{W}" height="{H}" preserveAspectRatio="none" opacity=".17" style="mix-blend-mode:soft-light" pointer-events="none"/>')
svg.append(f'<rect width="{W}" height="{H}" filter="url(#pigment)" opacity=".6" pointer-events="none"/>')
# The user requested credits to be consolidated outside the map UI.
# Source/license metadata is retained in the SVG description and handoff files.
svg.append('</svg>')
out=ROOT/'nishi-shinjuku-geographic-05.svg'
out.write_text('\n'.join(svg),encoding='utf-8')
anchors={
 'island_tower':{'osm_way':'137626254','lat':35.6931208,'lon':139.6930302},
 'shinjuku_police':{'osm_way':'137626342','lat':35.6935169,'lon':139.6945321},
 'tokyo_metropolitan_main':{'osm_way':'89877471','lat':35.6894906,'lon':139.6917116},
 'office_address_reference':{'lat':35.695038,'lon':139.69574,'source':'GSI address-search; reference only, not surveyed entrance'},
 'building_address_reference':{'lat':35.695789,'lon':139.691132,'source':'GSI address-search; reference only, not surveyed entrance'},
}
for a in anchors.values():
    px,py=xy(a['lon'],a['lat']);a['pixel']=[round(px,3),round(py,3)];a['percent']=[round(px/W*100,4),round(py/H*100,4)]
    assert 0<px<W and 0<py<H
metadata={'width':W,'height':H,'north_up':True,'projection':'EPSG:3857','bbox_wgs84':{'west':WEST,'south':SOUTH,'east':EAST,'north':NORTH},'projected_bounds_m':{'xmin':X0,'ymin':Y0,'xmax':X1,'ymax':Y1},'projected_m_per_pixel':M,'geometry_policy':'Coordinates unchanged; surface-only feature selection. Cartographic road widths and decorative fill texture do not imply surveyed widths.','license':'ODbL 1.0','attribution':'© OpenStreetMap contributors','license_url':'https://www.openstreetmap.org/copyright','sources':sources,'feature_counts':dict(counts),'reference_anchors':anchors,'pins_baked_in':False,'address_points_are_provisional':True}
(ROOT/'map-georeference-05.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'svg':str(out),'bbox':metadata['bbox_wgs84'],'counts':dict(counts),'anchors':anchors},ensure_ascii=False,indent=2))
