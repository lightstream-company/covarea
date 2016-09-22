'use strict';

const geolib = require('geolib');

const Geolib = geolib.constructor;

geolib.extend({
  /**
   * Computes the rhumb (loxodromic) distance between two given points, and a radius
   *
   * see http://www.movable-type.co.uk/scripts/latlong.html for the original code
   *
   * @param        object     origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
   * @param        object     destination coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
   * @param        float      optional (in meter), defaults to mean radius of the earth
   * @return       float      distance between origin and destination, in meter
   */
  getRhumbDistance: function (originLL, destinationLL, radius) {
    radius = radius ? Number(radius) : this.radius;

    // see http://williams.best.vwh.net/avform.htm#Rhumb

    const R = radius;
    const φ1 = this.latitude(originLL).toRad(), φ2 = this.latitude(destinationLL).toRad();
    const Δφ = φ2 - φ1;
    var Δλ = Math.abs(this.longitude(destinationLL) - this.longitude(originLL)).toRad();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) {
      Δλ = Δλ > 0 ? -(Geolib.PI_X2 - Δλ) : (Geolib.PI_X2 + Δλ);
    }

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    const Δψ = Math.log(Math.tan(φ2 / 2 + Geolib.PI_DIV4) / Math.tan(φ1 / 2 + Geolib.PI_DIV4));
    const q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    const δ = Math.sqrt(Δφ * Δφ + q * q * Δλ * Δλ); // angular distance in radians
    return δ * R;
  },

  /**
   * Computes the rhumb (loxodromic) mid point between two given points
   *
   * see http://www.movable-type.co.uk/scripts/latlong.html for the original code
   *
   * @param        object     origin coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
   * @param        object     destination coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
   * @return       object     rhumb mid point coordinate (e.g. {latitude: 51.5023, longitude: 7.3815})
   */
  getRhumbMidPoint: function (originLL, destinationLL) {
    // http://mathforum.org/kb/message.jspa?messageID=148837

    var φ1 = this.latitude(originLL).toRad(), λ1 = this.longitude(originLL).toRad();
    var φ2 = this.latitude(destinationLL).toRad(), λ2 = this.longitude(destinationLL).toRad();

    if (Math.abs(λ2 - λ1) > Math.PI) {
      λ1 += Geolib.PI_X2;
    } // crossing anti-meridian

    const φ3 = (φ1 + φ2) / 2;
    const f1 = Math.tan(Geolib.PI_DIV4 + φ1 / 2);
    const f2 = Math.tan(Geolib.PI_DIV4 + φ2 / 2);
    const f3 = Math.tan(Geolib.PI_DIV4 + φ3 / 2);
    var λ3 = ( (λ2 - λ1) * Math.log(f3) + λ1 * Math.log(f2) - λ2 * Math.log(f1) ) / Math.log(f2 / f1);

    if (!isFinite(λ3)) {
      λ3 = (λ1 + λ2) / 2;
    } // parallel of latitude

    return {
      latitude: φ3.toDeg(),
      longitude: (λ3.toDeg() + 540) % 360 - 180 // normalise to −180..+180°
    };
  }
});
