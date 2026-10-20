// Standalone integration example. No application state, network or dependencies.
const EARTH_RADIUS = 6378137;
const MAX_MERCATOR_LATITUDE = 85.0511287798066;

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
}

function dimensions(width, height) {
  finite(width, 'width'); finite(height, 'height');
  if (width <= 0 || height <= 0) throw new RangeError('Dimensions must be positive');
}

/** WGS84 longitude/latitude -> native image edge coordinates. Never clamp. */
export function geoToImage(manifest, { lon, lat }) {
  finite(lon, 'lon'); finite(lat, 'lat');
  if (lon < -180 || lon > 180 || Math.abs(lat) > MAX_MERCATOR_LATITUDE) {
    throw new RangeError('Coordinate is outside Web Mercator');
  }
  const { width, height } = manifest.asset;
  const { xmin, ymin, xmax, ymax } = manifest.projectedBounds;
  const east = EARTH_RADIUS * lon * Math.PI / 180;
  const north = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const u = (east - xmin) / (xmax - xmin);
  const v = (ymax - north) / (ymax - ymin);
  return { x: u * width, y: v * height, u, v, leftPercent: u * 100, topPercent: v * 100,
    insideImage: u >= -1e-9 && u <= 1 + 1e-9 && v >= -1e-9 && v <= 1 + 1e-9 };
}

/** Native image edge coordinates -> WGS84. Outside pixels remain outside. */
export function imageToGeo(manifest, { x, y }) {
  finite(x, 'x'); finite(y, 'y');
  const { width, height } = manifest.asset;
  const { xmin, ymin, xmax, ymax } = manifest.projectedBounds;
  const east = xmin + x / width * (xmax - xmin);
  const north = ymax - y / height * (ymax - ymin);
  return { lon: east / EARTH_RADIUS * 180 / Math.PI,
    lat: (2 * Math.atan(Math.exp(north / EARTH_RADIUS)) - Math.PI / 2) * 180 / Math.PI };
}

/** Exact image rectangle for CSS object-fit/background-size, with % object-position.
 * Returned offsets are relative to the map host's content box (no border/padding).
 */
export function getImageRect(manifest, { width, height }, fit = 'contain', position = { x: .5, y: .5 }) {
  dimensions(width, height);
  finite(position.x, 'position.x'); finite(position.y, 'position.y');
  if (position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) {
    throw new RangeError('Position uses fractions from 0 to 1');
  }
  const image = manifest.asset;
  dimensions(image.width, image.height);
  let scaleX = width / image.width, scaleY = height / image.height;
  if (fit === 'contain') scaleX = scaleY = Math.min(scaleX, scaleY);
  else if (fit === 'cover') scaleX = scaleY = Math.max(scaleX, scaleY);
  else if (fit !== 'fill') throw new RangeError('Supported fits: contain, cover, fill');
  const imageWidth = image.width * scaleX, imageHeight = image.height * scaleY;
  return { left: (width - imageWidth) * position.x, top: (height - imageHeight) * position.y,
    width: imageWidth, height: imageHeight, scaleX, scaleY };
}

/** Location -> host coordinates, including letterboxing/cropping offsets. */
export function geoToViewport(manifest, coordinate, viewport, fit = 'contain', position) {
  const point = geoToImage(manifest, coordinate);
  const rect = getImageRect(manifest, viewport, fit, position);
  const x = rect.left + point.x * rect.scaleX, y = rect.top + point.y * rect.scaleY;
  return { ...point, x, y, visible: point.insideImage && x >= -1e-7 && x <= viewport.width + 1e-7 && y >= -1e-7 && y <= viewport.height + 1e-7 };
}
