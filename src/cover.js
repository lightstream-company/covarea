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

function computeLatitudes(southWestGeolibPoint, distances, radius) {
  const circleCenterDistanceOnYAxis = computeCircleCenterDistanceOnYAxis(radius);
  const numberOfCirclesOnYAxis = Math.ceil(distances.yAxis / circleCenterDistanceOnYAxis);

  const latitudes = [];
  for (let iy = 0; iy < numberOfCirclesOnYAxis; iy++) {
    let distance = (circleCenterDistanceOnYAxis * iy) + (radius / 2);
    let latitude = geolib.computeDestinationPoint(southWestGeolibPoint, distance, 0).latitude;
    latitudes.push(latitude);
  }
  return latitudes;
}

function computeLongitudes(southWestGeolibPoint, distances, radius) {
  const circleCenterDistanceOnXAxis = computeCircleCenterDistanceOnXAxis(radius);
  const numberOfCirclesOnXAxis = Math.ceil(distances.xAxis / circleCenterDistanceOnXAxis);

  const longitudes = [];
  for (let ix = 0; ix < numberOfCirclesOnXAxis; ix++) {
    let distance = circleCenterDistanceOnXAxis * ix;
    let longitude = geolib.computeDestinationPoint(southWestGeolibPoint, distance, 90).longitude;
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
  const distances = {
    xAxis: computeDistanceOnXAxis(boundingBox),
    yAxis: computeDistanceOnYAxis(boundingBox)
  };

  const latitudes = computeLatitudes(boundingBox.southWest, distances, radius);
  const longitudes = computeLongitudes(boundingBox.northEast, distances, radius);

  const evenCircles = buildEvenLinesCircles(latitudes, longitudes, radius);
  const oddCircles = buildOddLinesCircles(latitudes, longitudes, radius);

  return evenCircles.concat(oddCircles);
}

function normalizeBoundingBox(boundingBox) {
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