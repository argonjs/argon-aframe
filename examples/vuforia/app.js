
// this is all about the load/splash screen
var arScene = document.querySelector('ar-scene');
var statusMsg = document.querySelector('#status');
var loader = document.querySelector('#loader-wrapper');
statusMsg.innerHTML = "loading argon and aframe...";
 var frame = document.querySelector("#frame");

var hudElem = document.querySelector("#lookattarget");
var hudElem2 = hudElem.cloneNode( true );
hudElem2.id = hudElem.id + "2";

arScene.addEventListener('argon-initialized', function(evt) {
    statusMsg.innerHTML = "argon initialized, starting vuforia...";
});
arScene.addEventListener('argon-vuforia-initialized', function(evt) {
    statusMsg.innerHTML = "vuforia initialized, downloading dataset...";
});
arScene.addEventListener('argon-vuforia-initialization-failed', function(evt) {
    statusMsg.innerHTML = "vuforia failed to initialize: " + evt.detail.error.message;
});

arScene.addEventListener('argon-vuforia-dataset-loaded', function(evt) {
    statusMsg.innerHTML = "done";
    loader.classList.add('loaded');

	// hudElem.style.display = 'inline-block'; // start hidden
    arScene.hud.appendChild(hudElem, hudElem2);

    frame.addEventListener('referenceframe-statuschanged', function(evt) {
        if (evt.detail.found) {
            hudElem.classList.add("hide");
            hudElem2.classList.add("hide");
	        // hudElem.style.display = 'none'; // hide when target seen
	        // hudElem2.style.display = 'none'; // hide when target seen
        } else {
            hudElem.classList.remove("hide");
            hudElem2.classList.remove("hide");
	        // hudElem.style.display = 'inline-block'; // show when target lost
	        // hudElem2.style.display = 'inline-block'; // hide when target seen
        }
    });
});
arScene.addEventListener('argon-vuforia-dataset-load-failed', function(evt) {
    statusMsg.innerHTML = "vuforia failed to load: " + evt.detail.error.message;
});

arScene.addEventListener('argon-vuforia-not-available', function(evt) {
    frame.setAttribute("trackvisibilty", false);
    frame.setAttribute("visible", true);
    frame.setAttribute("position", {x: 0, y: 0, z: -0.5});

    hudElem.innerHTML = "No Vuforia. Showing scene that would be on the target."
    hudElem.style.display = 'inline-block'; // show when target lost
    arScene.hud.appendChild(hudElem);

    statusMsg.innerHTML = "done";
    loader.classList.add('loaded');
});

arScene.addEventListener('enter-vr', function (evt) {
    hudElem.classList.add("viewerMode");
    hudElem2.classList.add("viewerMode");
});
arScene.addEventListener('exit-vr', function (evt) {
    hudElem.classList.remove("viewerMode");
    hudElem2.classList.remove("viewerMode");
});

var scene = document.querySelector('#stuff');
for (var i = 0; i < 12; i++) {
    var obj = document.createElement('a-entity');
    obj.setAttribute('geometry', {
        primitive: 'torusKnot',
        radius: Math.random() * 10,
        radiusTubular: Math.random() * .75,
        p: Math.round(Math.random() * 10),
        q: Math.round(Math.random() * 10)
    });
    obj.setAttribute('material', {
        color: getRandColor(),
        metalness: Math.random(),
        roughness: Math.random()
    });
    obj.setAttribute('position', {
        x: getRandCoord(),
        y: getRandCoord(),
        z: getRandCoord()/2 + 13 
    });
    scene.appendChild(obj);
}

function getRandColor () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandCoord () {
    var coord = Math.random() * 20;
    return Math.random() < .5 ? coord + 5 : coord * -1 - 5;
}