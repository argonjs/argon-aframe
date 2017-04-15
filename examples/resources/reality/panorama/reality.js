/// <reference types="@argonjs/argon"/>
/// <reference types="three"/>
/// <reference types="tween.js"/>
// save some local references to commonly used classes
var Cartesian3 = Argon.Cesium.Cartesian3;
var Quaternion = Argon.Cesium.Quaternion;
var CesiumMath = Argon.Cesium.CesiumMath;
// set up Argon (unlike regular apps, we call initRealityViewer instead of init)
// Defining a protocol allows apps to communicate with the reality in a
// reliable way. 
var app = Argon.initRealityViewer({
    protocols: ['ael.gatech.panorama@v1']
});
// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
scene.add(camera);
// We use the standard WebGLRenderer when we only need WebGL-based content
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
});
// account for the pixel density of the device
renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);
// Tell argon what local coordinate system you want.  The default coordinate
// frame used by Argon is Cesium's FIXED frame, which is centered at the center
// of the earth and oriented with the earth's axes.  
// The FIXED frame is inconvenient for a number of reasons: the numbers used are
// large and cause issues with rendering, and the orientation of the user's "local
// view of the world" is different that the FIXED orientation (my perception of "up"
// does not correspond to one of the FIXED axes).  
// Therefore, Argon uses a local coordinate frame that sits on a plane tangent to 
// the earth near the user's current location.  This frame automatically changes if the
// user moves more than a few kilometers.
// The EUS frame cooresponds to the typical 3D computer graphics coordinate frame, so we use
// that here.  The other option Argon supports is localOriginEastNorthUp, which is
// more similar to what is used in the geospatial industry
app.context.defaultReferenceFrame = app.context.localOriginEastUpSouth;
// A map to store our panoramas
var panoramas = new Map();
var currentPano;
// Create two pano spheres we can transition between
var sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
var panoSpheres = [new THREE.Mesh, new THREE.Mesh];
panoSpheres.forEach(function (mesh) {
    mesh.geometry = sphereGeometry;
    var material = new THREE.MeshBasicMaterial();
    material.transparent = true;
    mesh.material = material;
    scene.add(mesh);
});
var currentSphere = 0;
var X_90 = Quaternion.fromAxisAngle(Cartesian3.UNIT_X, Argon.Cesium.CesiumMath.PI_OVER_TWO);
// Creating a lot of garbage slows everything down. Not fun.
// Let's create some recyclable objects that we can use later.
var scratchCartesian = new Cartesian3;
var scratchQuaternion = new Quaternion;
var scratchQuaternionDragPitch = new Quaternion;
var scratchQuaternionDragYaw = new Quaternion;
var frustum = new Argon.Cesium.PerspectiveFrustum();
var aggregator = new Argon.Cesium.CameraEventAggregator(document.documentElement);
var subviews = new Array();
var frameStateOptions = {
    overrideStage: true,
    overrideUser: false
};
// Reality views must raise frame events at regular intervals in order to 
// drive updates for the entire system
app.device.frameStateEvent.addEventListener(function (frameState) {
    var time = frameState.time;
    Argon.SerializedSubviewList.clone(frameState.subviews, subviews);
    Argon.decomposePerspectiveProjectionMatrix(subviews[0].projectionMatrix, frustum);
    frustum.fov = app.view.subviews[0].frustum.fov;
    if (!frameState.strict) {
        if (aggregator.isMoving(Argon.Cesium.CameraEventType.WHEEL)) {
            var wheelMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.WHEEL);
            var diff = wheelMovement.endPosition.y;
            frustum.fov = Math.min(Math.max(frustum.fov - diff * 0.02, Math.PI / 8), Math.PI - Math.PI / 8);
        }
        if (aggregator.isMoving(Argon.Cesium.CameraEventType.PINCH)) {
            var pinchMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.PINCH);
            var diff = pinchMovement.distance.endPosition.y - pinchMovement.distance.startPosition.y;
            frustum.fov = Math.min(Math.max(frustum.fov - diff * 0.02, Math.PI / 8), Math.PI - Math.PI / 8);
        }
        subviews.forEach(function (s) {
            var aspect = s.viewport.width / s.viewport.height;
            frustum.aspectRatio = isFinite(aspect) && aspect !== 0 ? aspect : 1;
            Argon.Cesium.Matrix4.clone(frustum.projectionMatrix, s.projectionMatrix);
        });
    }
    if (currentPano) {
        app.context.stage.position.setValue(Cartesian3.ZERO, currentPano.entity);
        app.context.stage.orientation.setValue(Quaternion.IDENTITY);
    }
    // Get the physical device orientation
    var deviceUserOrientation = Argon.getEntityOrientation(app.device.user, time, app.device.stage, scratchQuaternion);
    if (!deviceUserOrientation) {
        frameStateOptions.overrideUser = true;
        var currentOrientation = currentPano && Argon.getEntityOrientationInReferenceFrame(app.context.user, time, currentPano.entity, scratchQuaternion) ||
            Quaternion.clone(X_90, scratchQuaternion);
        if (aggregator.isMoving(Argon.Cesium.CameraEventType.LEFT_DRAG)) {
            var dragMovement = aggregator.getMovement(Argon.Cesium.CameraEventType.LEFT_DRAG);
            // const dragPitch = Quaternion.fromAxisAngle(Cartesian3.UNIT_X, frustum.fov * (dragMovement.endPosition.y - dragMovement.startPosition.y) / app.viewport.current.height, scratchQuaternionDragPitch);
            var dragYaw = Quaternion.fromAxisAngle(Cartesian3.UNIT_Y, frustum.fov * (dragMovement.endPosition.x - dragMovement.startPosition.x) / app.view.viewport.width, scratchQuaternionDragYaw);
            // const drag = Quaternion.multiply(dragPitch, dragYaw, dragYaw);
            currentOrientation = Quaternion.multiply(currentOrientation, dragYaw, dragYaw);
        }
        app.context.user.position.setValue(Cartesian3.ZERO, app.context.stage);
        app.context.user.orientation.setValue(currentOrientation);
    }
    else {
        frameStateOptions.overrideUser = false;
    }
    aggregator.reset();
    // By publishing a view state, we are describing where we
    // are in the world, what direction we are looking, and how we are rendering 
    var contextFrameState = app.device.createContextFrameState(time, frameState.viewport, subviews, frameStateOptions);
    app.context.submitFrameState(contextFrameState);
});
// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.
app.updateEvent.addEventListener(function () {
    TWEEN.update();
});
// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // set the renderer to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.viewport;
    renderer.setSize(viewport.width, viewport.height);
    // there is 1 subview in monocular mode, 2 in stereo mode
    for (var _i = 0, _a = app.view.subviews; _i < _a.length; _i++) {
        var subview = _a[_i];
        // set camera orientation, ignoring the position since panoramas do not support free
        // movement
        camera.quaternion.copy(subview.pose.orientation);
        // set the projection matrix
        camera.projectionMatrix.fromArray(subview.frustum.projectionMatrix);
        // set the viewport for this view
        var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
        renderer.setViewport(x, y, width, height);
        // set the webGL rendering parameters and render this view
        renderer.setScissor(x, y, width, height);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
    }
});
// create a texture loader
var loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
// when the a controlling session connects, we can communite with it to
// receive commands (or even send information back, if appropriate)
app.reality.connectEvent.addEventListener(function (controlSession) {
    controlSession.on['edu.gatech.ael.panorama.loadPanorama'] = function (pano) {
        // if you throw an error in a message handler, the remote session will see the error!
        if (!pano.url)
            throw new Error('Expected an equirectangular image url!');
        var offsetRadians = (pano.offsetDegrees || 0) * CesiumMath.DEGREES_PER_RADIAN;
        var entity = new Argon.Cesium.Entity;
        if (Argon.Cesium.defined(pano.longitude) &&
            Argon.Cesium.defined(pano.longitude)) {
            var positionProperty = new Argon.Cesium.ConstantPositionProperty(undefined);
            var positionValue = Cartesian3.fromDegrees(pano.longitude, pano.latitude, pano.height || 0);
            positionProperty.setValue(positionValue, Argon.Cesium.ReferenceFrame.FIXED);
            entity.position = positionProperty;
            var orientationProperty = new Argon.Cesium.ConstantProperty();
            // calculate the orientation for the ENU coodrinate system at the given position
            var orientationValue = Argon.Cesium.Transforms.headingPitchRollQuaternion(positionValue, 0, 0, 0);
            // TODO: apply offsetDegrees to orientation
            orientationProperty.setValue(orientationValue);
            entity.orientation = orientationProperty;
        }
        var texture = new Promise(function (resolve) {
            loader.load(pano.url, function (texture) {
                texture.minFilter = THREE.LinearFilter;
                resolve(texture);
            });
        });
        panoramas.set(pano.url, {
            url: pano.url,
            longitude: pano.longitude,
            latitude: pano.latitude,
            height: pano.height,
            offsetDegrees: pano.offsetDegrees,
            entity: entity,
            texture: texture
        });
        // We can optionally return a value (or a promise of a value) in a message handler. 
        // In this case, if three.js throws an error while attempting to load
        // the texture, the error will be passed to the remote session. Otherwise,
        // this function will respond as fulfilled when the texture is loaded. 
        return texture.then(function () { });
    };
    controlSession.on['edu.gatech.ael.panorama.deletePanorama'] = function (_a) {
        var url = _a.url;
        panoramas.delete(url);
    };
    controlSession.on['edu.gatech.ael.panorama.showPanorama'] = function (options) {
        showPanorama(options);
    };
});
function showPanorama(options) {
    var url = options.url;
    var transition = options.transition || {};
    var easing = resolve(transition.easing, TWEEN.Easing) || TWEEN.Easing.Linear.None;
    if (!url)
        throw new Error('Expected a url');
    if (!easing)
        throw new Error('Unknown easing: ' + easing);
    var panoOut = currentPano;
    var panoIn = panoramas.get(url);
    if (!panoIn)
        throw new Error('Unknown pano: ' + url + ' (did you forget to add the panorama first?)');
    currentPano = panoIn;
    // get the threejs objects for rendering our panoramas
    var sphereOut = panoSpheres[currentSphere];
    currentSphere++;
    currentSphere %= 2;
    var sphereIn = panoSpheres[currentSphere];
    var inMaterial = sphereIn.material;
    var outMaterial = sphereOut.material;
    // update the material for the incoming panorama
    inMaterial.map = undefined;
    inMaterial.opacity = 1;
    inMaterial.needsUpdate = true;
    panoIn.texture.then(function (texture) {
        inMaterial.map = texture;
        inMaterial.needsUpdate = true;
    });
    // update the pose of the pano spheres
    sphereIn.rotation.y = (panoIn.offsetDegrees || 0) * CesiumMath.RADIANS_PER_DEGREE;
    // negate one scale component to flip the spheres inside-out,
    // and make the incoming sphere slightly smaller so it is seen infront of
    // the outgoing sphere
    sphereIn.scale.set(-1, 1, 1);
    sphereOut.scale.set(-0.9, 0.9, 0.9);
    // force render order
    sphereIn.renderOrder = 0;
    sphereOut.renderOrder = 1;
    // fade out the old pano using tween.js!
    TWEEN.removeAll();
    var outTween = new TWEEN.Tween(outMaterial);
    outTween.to({ opacity: 0 }, transition.duration).onUpdate(function () {
        outMaterial.needsUpdate = true;
    }).easing(easing).start();
    outMaterial.opacity = 1;
    outMaterial.needsUpdate = true;
}
function resolve(path, obj, safe) {
    if (safe === void 0) { safe = true; }
    if (!path)
        return undefined;
    return path.split('.').reduce(function (prev, curr) {
        return !safe ? prev[curr] : (prev ? prev[curr] : undefined);
    }, obj || self);
}
