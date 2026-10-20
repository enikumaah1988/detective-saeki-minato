"""Verify the exported SVG still uses the source OSM vertices, not AI geometry."""
from pathlib import Path
import xml.etree.ElementTree as ET
import json
import math
import re
import struct
import hashlib

root=Path(__file__).resolve().parent
meta=json.loads((root/'map-georeference-05.json').read_text(encoding='utf-8'))
nodes={};ways={}
for p in root.glob('osm-*.xml'):
    el=ET.parse(p).getroot()
    nodes.update({n.attrib['id']:n for n in el.findall('node')})
    ways.update({w.attrib['id']:w for w in el.findall('way')})
def project(n):
    lon=float(n.attrib['lon']);lat=float(n.attrib['lat'])
    x=6378137*math.radians(lon)
    y=6378137*math.log(math.tan(math.pi/4+math.radians(lat)/2))
    return ((x-meta['projected_bounds_m']['xmin'])/meta['projected_m_per_pixel'],(meta['projected_bounds_m']['ymax']-y)/meta['projected_m_per_pixel'])
svg=ET.parse(root/'nishi-shinjuku-geographic-05.svg').getroot()
checked=0;vertices=0;max_error=0
for p in svg.iter('{http://www.w3.org/2000/svg}path'):
    way_id=p.attrib.get('data-osm-way')
    if not way_id:continue
    assert 'transform' not in p.attrib
    pairs=re.findall(r'(-?[\d.]+),(-?[\d.]+)',p.attrib['d'])
    expected=[project(nodes[n.attrib['ref']]) for n in ways[way_id].findall('nd') if n.attrib['ref'] in nodes]
    assert len(pairs)==len(expected),(way_id,len(pairs),len(expected))
    for (a,b),(x,y) in zip(pairs,expected):
        error=math.hypot(float(a)-x,float(b)-y)
        assert error<0.00071,(way_id,error)
        max_error=max(max_error,error);vertices+=1
    checked+=1
assert checked>5000
assert meta['reference_anchors']['building_address_reference']['pixel'][0]<meta['reference_anchors']['office_address_reference']['pixel'][0]
assert meta['reference_anchors']['building_address_reference']['pixel'][1]<meta['reference_anchors']['office_address_reference']['pixel'][1]
assert meta['reference_anchors']['shinjuku_police']['pixel'][0]>meta['reference_anchors']['island_tower']['pixel'][0]
assert meta['reference_anchors']['tokyo_metropolitan_main']['pixel'][1]>meta['reference_anchors']['island_tower']['pixel'][1]
png=root.parents[3]/'src/assets/images/maps/nishi-shinjuku-geographic-05.png'
data=png.read_bytes()
assert data[:8]==b'\x89PNG\r\n\x1a\n'
w,h=struct.unpack('>II',data[16:24])
assert (w,h)==(2400,1600)
report={'passed':True,'source_geometry_paths_verified':checked,'vertices_verified':vertices,'max_rounding_error_px':max_error,'coordinate_displacement_applied':False,'png_size':[w,h],'png_sha256':hashlib.sha256(data).hexdigest(),'orientation_checks_passed':True,'not_verified':['survey accuracy of OSM','exact fictional building entrances','company address not yet chosen','live gameplay appearance'],'visual_crosscheck':'GSI standard tile mosaic: main road topology, railway corridor, central park and metropolitan government area compared visually; no GSI imagery in deliverable.'}
(root/'validation-05.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
