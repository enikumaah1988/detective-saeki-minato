import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { geoToImage } from './map-coordinates.mjs';

const geographic = new URL('../geographic/', import.meta.url);
const assets = new URL('../../../../src/assets/images/maps/', import.meta.url);
const meta = JSON.parse(await readFile(new URL('map-georeference-05.json', geographic), 'utf8'));
const file = 'nishi-shinjuku-geographic-05.png';
const png = await readFile(new URL(file, assets));
if (png.readUInt32BE(16) !== meta.width || png.readUInt32BE(20) !== meta.height) throw new Error('PNG extent mismatch');
const location = (id, name, referenceId, status) => {
  const a = meta.reference_anchors[referenceId];
  return { id, name, status, coordinate: { lon: a.lon, lat: a.lat },
    imagePixel: { x: a.pixel[0], y: a.pixel[1] },
    percent: { left: a.percent[0], top: a.percent[1] }, referenceId,
    note: '参照点。架空施設の入口・ピンの最終位置は未確定。' };
};
const companyCoordinate = { lon: 139.69355, lat: 35.6929 };
const companyPoint = geoToImage({asset:{width:meta.width,height:meta.height},projectedBounds:meta.projected_bounds_m}, companyCoordinate);
const manifest = {
  schemaVersion: 1,
  mapId: 'nishi-shinjuku-geographic-05',
  asset: { file, width: meta.width, height: meta.height, sha256: createHash('sha256').update(png).digest('hex') },
  geographicCRS: 'EPSG:4326', projectedCRS: 'EPSG:3857',
  earthRadiusMeters: 6378137,
  boundsWGS84: meta.bbox_wgs84,
  projectedBounds: meta.projected_bounds_m,
  orientation: { north: 'top', east: 'right', rotationDegrees: 0 },
  coordinates: { input: '{lon, lat}, WGS84 degrees', origin: 'top-left image edge', x: 'right', y: 'down',
    imageExtent: [0, 0, meta.width, meta.height], pixelConvention: 'continuous image-edge coordinates; bottom-right edge=(2400,1600)',
    outsidePolicy: 'retain outside coordinates; hide or use another map, never clamp',
    percentConvention: 'left=100*x/width, top=100*y/height; relative to rendered IMAGE rectangle, not letterbox host' },
  display: { recommendedFit: 'cover', recommendedObjectPosition: '50% 50%',
    aspectRatio: [3, 2], resize: 'use exact rendered image rectangle for both image and pin layer',
    crop: 'cover requires cropping offsets; see getImageRect example',
    paddingAndBorders: 'put border/padding on an outer wrapper, not the coordinate host' },
  locations: [
    location('office', '佐伯探偵事務所', 'office_address_reference', 'address_reference'),
    location('building', '成子坂共同ビル', 'building_address_reference', 'address_reference'),
    location('police', '西新宿警察署', 'shinjuku_police', 'building_reference'),
    { id: 'company', name: '東成ビルサービス', status: 'fictional_location', coordinate: companyCoordinate,
      buildingName: '東成ビルサービス入居ビル',
      imagePixel: { x: companyPoint.x, y: companyPoint.y },
      percent: { left: companyPoint.leftPercent, top: companyPoint.topPercent },
      note: '西新宿六丁目の架空のオフィスビルとして設定したゲーム用の位置。実在施設の名称・住所・入居企業を示さない。' },
  ],
  remoteLocations: [
    { id: 'takase-home', name: '高瀬家', mapId: null, coordinate: null, status: 'outside-area-unresolved', note: '新宿区外。西新宿内に丸めて表示しない。' },
    { id: 'hideout', name: '潜伏先', mapId: null, coordinate: null, status: 'unresolved', note: '場所未決。既存地点に推測で割り当てない。' },
  ],
  attribution: { text: meta.attribution, url: meta.license_url, license: 'ODbL-1.0',
    bakedIntoImage: false, displayPlacement: 'centralized-licenses-planned', centralizedDisplayImplemented: false },
};
await writeFile(new URL('nishi-shinjuku-geographic-05.mapping.json', assets), JSON.stringify(manifest, null, 2) + '\n');
// PNG world file: pixel-center registration, unlike the runtime edge coordinates.
const b = meta.projected_bounds_m;
const dx = (b.xmax-b.xmin)/meta.width, dy = (b.ymax-b.ymin)/meta.height;
const world = [dx,0,0,-dy,b.xmin+dx/2,b.ymax-dy/2];
await writeFile(new URL('nishi-shinjuku-geographic-05.pgw', assets), world.map(n=>n.toFixed(12)).join('\n')+'\n');
console.log('Mapping manifest and EPSG:3857 world file saved; PNG unchanged.');
