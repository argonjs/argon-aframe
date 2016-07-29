(function () {

// here we are using pure Cesium and THREE functions.
// should consider adding in SunCalc (https://github.com/mourner/suncalc) support, to get
// some more information about sun/moon,  such as time of day and phase of moon

var Cesium = Argon.Cesium;
var Cartesian3 = Cesium.Cartesian3;
var Simon1994PlanetaryPositions = Cesium.Simon1994PlanetaryPositions;
var JulianDate = Cesium.JulianDate;
var CesiumMath = Cesium.CesiumMath;
var Transforms = Cesium.Transforms;
var ReferenceFrame = Cesium.ReferenceFrame;

// Add function to argon to get the Sun and Moon entities, and to update them
Argon.GetSunMoon = function () {
    var moonEntity = new Cesium.Entity({
        name: "moon",
        position: Cartesian3.ZERO,
        orientation: Cesium.Quaternion.IDENTITY
    });
    var sunEntity = new Cesium.Entity({
        name: "sun",
        position: Cartesian3.ZERO,
        orientation: Cesium.Quaternion.IDENTITY
    });

    return function () {
        return { moon: moonEntity, sun: sunEntity}
    };
}();

Argon.UpdateSunMoon = function() {
    var icrfToFixed = new Cesium.Matrix3();
    var entities = Argon.GetSunMoon();

    return function (date, frame) {
        if (!Cesium.defined(Transforms.computeIcrfToFixedMatrix(date, icrfToFixed))) {
            Transforms.computeTemeToPseudoFixedMatrix(date, icrfToFixed);
        }

        var retVal = {
            sun: new Cesium.Cartesian3(),
            moon: new Cesium.Cartesian3()
        }

        var translation = Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(date, retVal.moon);
        Cesium.Matrix3.multiplyByVector(icrfToFixed, translation, translation);
        entities.moon.position.setValue(translation, ReferenceFrame.FIXED);
        if (frame != ReferenceFrame.FIXED) {
            translation = entities.moon.position.getValueInReferenceFrame(date, frame);
            if (translation) {
                entities.moon.position.setValue(translation, frame);
                translation.clone(retVal.moon);
            } else {
                retVal.moon.x = retVal.moon.z = 0;
                retVal.moon.y = -1;
            }
        }

        translation = Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(date, retVal.sun);
        Cesium.Matrix3.multiplyByVector(icrfToFixed, translation, translation);
        entities.sun.position.setValue(translation, ReferenceFrame.FIXED);
        if (frame != ReferenceFrame.FIXED) {
            translation = entities.sun.position.getValueInReferenceFrame(date, frame);
            if (translation) {
                entities.sun.position.setValue(translation, frame);
                translation.clone(retVal.sun);
            } else {
                retVal.sun.x = retVal.sun.z = 0;
                retVal.sun.y = 1;
            }
        }

        return retVal;
    }
}();

if (typeof(THREE) !== 'undefined') {

    // if we're using THREE, let's create an object that we can use to retrieve 
    // directional lights associated with the  

    THREE.SunMoonLights = function () {
        // get the natural light entities, make them available
        this.entities = Argon.GetSunMoon();

        // make the moon a dimmer, bluish light.  Not really correct, but a start
        var moonlight = new THREE.DirectionalLight(0x9999aa, 0.25);
        var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.moon = moonlight;
        this.sun = sunlight;
        
        // make the lights visible from outside
        lights = new THREE.Object3D();
        this.lights = lights;

        var lastTime = null;
        this.update = function(date, frame) {
            if (!lastTime || JulianDate.secondsDifference(date,lastTime) > 1) {            
                if (!lastTime) {
                    lastTime = date.clone();
                }
                else {
                    date.clone(lastTime)
                }

                var positions = Argon.UpdateSunMoon(date, frame);

                var translation = positions.moon;
                Cartesian3.normalize(translation, translation);
                moonlight.position.set(translation.x, translation.y, translation.z);
                if (translation.y > 0) {
                    lights.remove(moonlight);
                    lights.add(moonlight);
                } else {
                    lights.remove(moonlight);
                }

                translation = positions.sun;
                Cartesian3.normalize(translation, translation);
                sunlight.position.set(translation.x, translation.y, translation.z);
                if (translation.y > 0) {
                    lights.remove(sunlight);
                    lights.add(sunlight);
                } else {
                    lights.remove(sunlight);
                }
            }
        }
    }
}

})();