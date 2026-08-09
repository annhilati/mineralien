export const MAP_CONFIG = {
  initialViewState: {
    longitude: 12.36345,
    latitude: 47.20186,
    zoom: 17,
    pitch: 60,
    bearing: 0
  },
  baseStyleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  terrainUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  terrainMaxZoom: 12,
  terrainEncoding: 'terrarium',
  terrainExaggeration: 1.2,
  contourThresholds: {
    11: [200, 100],
    12: [100, 50],
    14: [50, 10]
  }
};
