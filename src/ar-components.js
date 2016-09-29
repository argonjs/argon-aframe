var zeroScale = 0.00001;

AFRAME.registerComponent('fixedsize', {
  schema: { 
    default: 1
  },

  init: function () {
      this.scale = 1;
      this.factor = 1;
  },

  update: function () {
    var data = this.data;
    this.scale = data === 0 ? zeroScale : data;
  },

  tick: function (t) {
    var object3D = this.el.object3D;
    var camera = this.el.sceneEl.camera;
    if (!camera) {return;}

    var cameraPos = camera.getWorldPosition();
    var thisPos = object3D.getWorldPosition();
    var distance = thisPos.distanceTo(cameraPos);

    // base the factor on the viewport height
    var viewport = this.el.sceneEl.argonApp.view.getViewport();
    this.factor = 2 * (this.scale / viewport.height); 

    // let's get the fov scale factor from the camera
    fovScale = Math.tan(THREE.Math.degToRad(camera.fov) / 2) * 2;

    // if distance < near clipping plane, just use scale.  Don't go any bigger
    var factor = fovScale * (distance < camera.near ? this.factor : distance * this.factor);
    object3D.scale.set(factor, factor, factor);
  }
});

AFRAME.registerComponent('trackvisibility', {
  schema: { 
    default: true
  },

  init: function () {
    var self = this;
    this.el.sceneEl.addEventListener('referenceframe-statuschanged', function(evt) {
        self.updateVisibility(evt);
    });
  },

  updateVisibility: function (evt) {
    console.log("visibility changed: " + evt.detail.found)
    if (this.data && evt.detail.target === this.el) {
      this.el.object3D.visible = evt.detail.found;
    }
  },

  update: function () {
  }
}); 

AFRAME.registerComponent('desiredreality', {
    schema: {
        src: {type: 'src'},
        name: {default: "Custom Reality"}
    },
    
    init: function () {
        var el = this.el;

        if (!el.isArgon) {
            console.warn('vuforiadataset should be attached to an <ar-scene>.');
        }
    },

    remove: function () {
        var el = this.el;
        if (el.isArgon) {
          el.argonApp.reality.setDesired(undefined);
        }
    },

    update: function () {
        var el = this.el;
        var data = this.data;

        if (el.isArgon) {
          el.argonApp.reality.setDesired({
            title: data.name,
            uri: Argon.resolveURL(data.src)
          });
        }
    }
});