import definition from '../../assets/images/maps/nishi-shinjuku-geographic-05.mapping.json'

export const travelMapDefinition = definition
export const travelMapImage = new URL('../../assets/images/maps/nishi-shinjuku-geographic-05.png', import.meta.url).href

/** Native map coordinates are projected image edges, with north at the top. */
export function travelMapPoint(id: string) {
  const coordinate = definition.locations.find(location => location.id === id)?.coordinate
  if (!coordinate) return undefined
  const { xmin, ymin, xmax, ymax } = definition.projectedBounds
  const east = definition.earthRadiusMeters * coordinate.lon * Math.PI / 180
  const north = definition.earthRadiusMeters * Math.log(Math.tan(Math.PI / 4 + coordinate.lat * Math.PI / 360))
  const left = (east - xmin) / (xmax - xmin) * 100
  const top = (ymax - north) / (ymax - ymin) * 100
  return left >= 0 && left <= 100 && top >= 0 && top <= 100 ? { left, top } : undefined
}

export function travelMapSize(width: number, height: number) {
  const scale = Math.min(width / definition.asset.width, height / definition.asset.height)
  return { width: definition.asset.width * scale, height: definition.asset.height * scale }
}
