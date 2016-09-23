/*eslint no-unused-vars:0 */
'use strict';

const chai = require('chai');
const should = chai.should();

require('../src/geolibExtension');
const cover = require('../src/cover');

describe('cover behavior', () => {
  it('should cover a small bounding box with a single circle, when max radius is greater than bounding box', () => {
    const boundingBox = {
      southWest: {lat: 0, lon: 0},
      northEast: {lat: 1, lon: 1},
    };
    const maxRadius = 100000;

    const coverage = cover(boundingBox, maxRadius);

    coverage.should.have.a.lengthOf(1);
    coverage[0].center.lat.should.be.closeTo(0.5, 0.001);
    coverage[0].center.lon.should.be.closeTo(0.5, 0.001);
    coverage[0].radius.should.be.closeTo(78712, 1);
  });

  it('should cover a bounding box with circles, using honeycomb strategy, when bounding box larger than max radius', () => {
    const boundingBox = {
      southWest: {lat: 0, lon: 0},
      northEast: {lat: 10, lon: 10},
    };
    const maxRadius = 300000;

    const coverage = cover(boundingBox, maxRadius);

    coverage.should.have.a.lengthOf(8);

    coverage[0].center.lat.should.be.closeTo(1.347, 0.0005);
    coverage[0].center.lon.should.be.closeTo(0, 0.001);
    coverage[0].radius.should.equal(maxRadius);
  });
});