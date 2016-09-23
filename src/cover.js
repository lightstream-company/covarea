'use strict';

const geolib = require('geolib');

function computeCircleCenterDistanceOnXAxis(radius) {
  return radius * Math.sqrt(3) / 2;
}

function computeCircleCenterDistanceOnYAxis(radius) {
  return 3 * radius / 2;
}

function computeDistanceOnXAxis(boundingBox) {
  return geolib.getRhumbDistance(
    boundingBox.southWest, {
      latitude: boundingBox.southWest.latitude,
      longitude: boundingBox.northEast.longitude
    });
}

function computeDistanceOnYAxis(boundingBox) {
  return geolib.getRhumbDistance(
    boundingBox.southWest, {
      latitude: boundingBox.northEast.latitude,
      longitude: boundingBox.southWest.longitude
    });
}

function computeLatitudes(boundingBox, radius) {
  const distanceOnYAxis = computeDistanceOnYAxis(boundingBox);
  const circleCenterDistanceOnYAxis = computeCircleCenterDistanceOnYAxis(radius);
  const numberOfCirclesOnYAxis = Math.ceil(distanceOnYAxis / circleCenterDistanceOnYAxis);

  const latitudes = [];
  for (let iy = 0; iy < numberOfCirclesOnYAxis; iy++) {
    let distance = (circleCenterDistanceOnYAxis * iy) + (radius / 2);
    let latitude = geolib.computeDestinationPoint(boundingBox.southWest, distance, 0).latitude;
    latitudes.push(latitude);
  }
  return latitudes;
}

function computeLongitudes(boundingBox, radius) {
  const distanceOnXAxis = computeDistanceOnXAxis(boundingBox);
  const circleCenterDistanceOnXAxis = computeCircleCenterDistanceOnXAxis(radius);
  const numberOfCirclesOnXAxis = Math.ceil(distanceOnXAxis / circleCenterDistanceOnXAxis);

  const longitudes = [];
  for (let ix = 0; ix < numberOfCirclesOnXAxis; ix++) {
    let distance = circleCenterDistanceOnXAxis * ix;
    let longitude = geolib.computeDestinationPoint(boundingBox.southWest, distance, 90).longitude;
    longitudes.push(longitude);
  }
  return longitudes;
}

function buildCircles(latitudes, longitudes, radius, even) {
  const circles = [];
  const startIndex = even ? 0 : 1;
  for (let iLat = startIndex; iLat < latitudes.length; iLat = iLat + 2) {
    for (let iLon = startIndex; iLon < longitudes.length; iLon = iLon + 2) {
      circles.push({
        center: {
          lat: latitudes[iLat],
          lon: longitudes[iLon]
        },
        radius
      });
    }
  }
  return circles;
}

function buildEvenLinesCircles(latitudes, longitudes, radius) {
  return buildCircles(latitudes, longitudes, radius, true);
}

function buildOddLinesCircles(latitudes, longitudes, radius) {
  return buildCircles(latitudes, longitudes, radius, false);
}

function honeycomb(boundingBox, radius) {
  const latitudes = computeLatitudes(boundingBox, radius);
  const longitudes = computeLongitudes(boundingBox, radius);

  const evenCircles = buildEvenLinesCircles(latitudes, longitudes, radius);
  const oddCircles = buildOddLinesCircles(latitudes, longitudes, radius);

  return evenCircles.concat(oddCircles);
}

function normalizeBoundingBox(boundingBox) {
  if (Array.isArray(boundingBox)) {
    return {
      southWest: {
        latitude: boundingBox[0],
        longitude: boundingBox[1]
      },
      northEast: {
        latitude: boundingBox[2],
        longitude: boundingBox[3]
      }
    };
  }
  return {
    southWest: {
      latitude: boundingBox.southWest.lat,
      longitude: boundingBox.southWest.lon
    },
    northEast: {
      latitude: boundingBox.northEast.lat,
      longitude: boundingBox.northEast.lon
    }
  };
}

function singleCircle(boundingBox, radius) {
  const midPoint = geolib.getRhumbMidPoint(boundingBox.southWest, boundingBox.northEast);
  return [{
    center: {
      lat: midPoint.latitude,
      lon: midPoint.longitude
    },
    radius
  }];
}

function cover(boundingBox, maxRadius) {
  const normalizedBoundingBox = normalizeBoundingBox(boundingBox);

  const boundingBoxHigherDistanceToCenter =
    geolib.getRhumbDistance(normalizedBoundingBox.southWest, normalizedBoundingBox.northEast) / 2;

  var radius = maxRadius;
  var strategy = honeycomb;

  if (boundingBoxHigherDistanceToCenter < maxRadius) {
    radius = boundingBoxHigherDistanceToCenter;
    strategy = singleCircle;
  }

  return strategy(normalizedBoundingBox, radius);
}

module.exports = cover;