import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { geoToImage, imageToGeo, getImageRect, geoToViewport } from './map-coordinates.mjs';

const assets = new URL('../../../../src/assets/images/maps/', import.meta.url);
const m = JSON.parse(await readFile(new URL('nishi-shinjuku-geographic-05.mapping.json', assets), 'utf8'));
const source = JSON.parse(await readFile(new URL('../geographic/map-georeference-05.json', import.meta.url), 'utf8'));
const png = await readFile(new URL(m.asset.file, assets));
assert.equal(createHash('sha256').update(png).digest('hex'), m.asset.sha256);
assert.equal(m.asset.sha256, 'e6f7172d8b82b5530ca8f5b0dc999ec0db931c9065496b1e561289de413fcbab');
assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [2400,1600]);
function near(a,b,tol=1e-6) { assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`); }
const b = m.boundsWGS84;
for (const [lon,lat,x,y] of [
  [b.west,b.north,0,0], [b.east,b.north,2400,0],
  [b.west,b.south,0,1600], [b.east,b.south,2400,1600],
]) {
  const p=geoToImage(m,{lon,lat}); near(p.x,x);near(p.y,y);assert.equal(p.insideImage,true);
  const g=imageToGeo(m,{x,y});near(g.lon,lon,1e-10);near(g.lat,lat,1e-10);
  assert.equal(geoToViewport(m,{lon,lat},{width:900,height:650}).visible,true);
}
for (const a of Object.values(source.reference_anchors)) {
  const p=geoToImage(m,a);near(p.x,a.pixel[0],.001);near(p.y,a.pixel[1],.001);
  const g=imageToGeo(m,p);near(g.lon,a.lon,1e-10);near(g.lat,a.lat,1e-10);
}
// Independent layout fixtures: a 3:2 map in a 900x650 host.
assert.deepEqual(getImageRect(m,{width:900,height:650}),{left:0,top:25,width:900,height:600,scaleX:.375,scaleY:.375});
assert.deepEqual(getImageRect(m,{width:900,height:650},'cover'),{left:-37.5,top:0,width:975,height:650,scaleX:.40625,scaleY:.40625});
assert.deepEqual(getImageRect(m,{width:900,height:650},'fill'),{left:0,top:0,width:900,height:650,scaleX:.375,scaleY:.40625});
assert.deepEqual(getImageRect(m,{width:1200,height:600},'contain',{x:1,y:0}),{left:300,top:0,width:900,height:600,scaleX:.375,scaleY:.375});
const a=source.reference_anchors.office_address_reference;
const office=geoToViewport(m,a,{width:900,height:650});
near(office.x,461.3685,.001);near(office.y,215.263,.001);assert.equal(office.visible,true);
assert.equal(geoToViewport(m,{lon:b.west,lat:b.north},{width:900,height:650},'cover').visible,false);
assert.equal(geoToImage(m,{lon:b.west-.01,lat:b.north}).insideImage,false);
assert.ok(geoToImage(m,{lon:b.west-.01,lat:b.north}).x<0); // outside points were not clamped
assert.throws(()=>geoToImage(m,{lon:35.695,lat:139.695}),RangeError); // swapped coordinates
assert.throws(()=>geoToImage(m,{lon:NaN,lat:0}),TypeError);
assert.throws(()=>getImageRect(m,{width:0,height:650}),RangeError);
assert.equal(m.locations.find(p=>p.id==='company').coordinate,null);
assert.ok(m.remoteLocations.every(p=>p.coordinate===null && p.mapId===null));
const world=(await readFile(new URL('nishi-shinjuku-geographic-05.pgw',assets),'utf8')).trim().split(/\s+/).map(Number);
assert.equal(world.length,6);
near(world[0],source.projected_m_per_pixel,1e-10);near(world[3],-world[0],1e-10);
near(world[4]-world[0]/2,source.projected_bounds_m.xmin,1e-8);
near(world[5]-world[3]/2,source.projected_bounds_m.ymax,1e-8);
const result={passed:true,pngUnchanged:true,corners:4,independentControlPoints:5,displayFitCases:4,
  pixelCenterWorldFileVerified:true,resizeAndCropOffsetsVerified:true,unresolvedLocationsNotAssigned:true,
  productionAppModified:false};
await writeFile(new URL('verification.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
