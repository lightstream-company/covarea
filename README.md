# covarea
Calculate the coverage of a rectangular area by circles on a 2D map

It basically uses either a single circle, if bounding box is smaller than the max radius, or a honeycomb distribution to optimize the coverage of a larger area.

# Usage

Run `npm i -S covarea`

Then

```javascript
const cover = require('coverea');

const boundingBox = {
  southWest: { lat: 0, lon: 0 },
  northEast: { lat: 10, lon: 10 }
}; // in decimal format

const maxRadius = 300000; // in meters

const coverage = cover(boundingBox, maxRadius);

/*
coverage.length : 8

coverage[0] : {
  center: { lat: 1.34747, lon: 0 },
  radius: 300000
}
*/
```

# Thanks

Thanks to :
* [manuelbieh](https://github.com/manuelbieh) for the [geolib](https://github.com/manuelbieh/geolib) library.
* To Jeffrey Sax for his answer in http://stackoverflow.com/questions/7716460/fully-cover-a-rectangle-with-minimum-amount-of-fixed-radius-circles
* The guys behind this site: http://www.movable-type.co.uk/scripts/latlong.html! Very helpful!
