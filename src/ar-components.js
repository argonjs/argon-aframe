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

    // base the factor on the viewport height.   
    // I think we need to use the renderviewport size, since we really care about what is rendered.
    // This means that when we're rendering on an HMD, and are using this to scale HTML content, the content might be 
    // the wrong size
    var height = this.el.sceneEl.argonApp.view.renderHeight;
    this.factor = 2 * (this.scale / height); 

    // let's get the fov scale factor from the camera
    fovScale = Math.tan(THREE.Math.degToRad(camera.fov) / 2) * 2;

    // if distance < near clipping plane, just use scale at the near plane.  Don't go any bigger
    var factor = fovScale * (distance < camera.near ? camera.near * this.factor : distance * this.factor);
    object3D.scale.set(factor, factor, factor);
  }
});

AFRAME.registerComponent('trackvisibility', {
  schema: { 
    default: true
  },

  init: function () {
    var self = this;
    this.el.addEventListener('referenceframe-statuschanged', function(evt) {
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

AFRAME.registerComponent('physical', {
  schema: { 
    default: true
  },

  init: function () {
  },

  // have to use tick and do this every frame since "mesh" could change and 
  // we won't be notified.  Bummer
  tick: function () {
    if (this.data) {
      var mesh = this.el.getObject("mesh");
      if (mesh) {
      	mesh.material.colorWrite = false; // only update the depth
	      mesh.renderOrder = -1;   // before everything else
      }  
    }
  }
}); 

AFRAME.registerComponent('show-in', {
  schema: { 
    ar: {default: false},
    vr: {default: false},
    "arhmd": { default: false},
    "vrhmd": { default: false} 
  },

  init: function () {
    var self = this;
    this.el.sceneEl.addEventListener('enter-vr', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('exit-vr', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('enter-ar', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('exit-ar', function (evt) { self.updateVisibility(evt); });
  },

  updateVisibility: function (evt) {
    if (evt.detail.target != this.el) {
      return;
    }

    var armode = this.is('ar-mode');
    var hmdmode = this.is('vr-mode');

    var data = this.data;
    var visible = false;

    if (data.arhmd && armode && hmdmode) { visible = true;}
    if (data.vrhmd && !armode && hmdmode) { visible = true;}
    if (data.ar && armode) { visible = true;}
    if (data.vr && !armode) { visible = true;}
  
    this.el.object3D.visible = visible;
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

/**
 * based on https://github.com/Utopiah/aframe-triggerbox-component
 * 
 * Usage <a-entity radius=10 trigger="event: mytrigger" /> will make a 10 unit 
 * trigger region around the entity that emits the event mytrigger_entered once 
 * the camera moves in and event mytrigger_exited once the camera leaves it.
 *
 * It can also be used on other entity e.g. an enemy or a bonus.
 *
 * inspired by https://github.com/atomicguy/aframe-fence-component/
 *
 */
AFRAME.registerComponent('trigger', {
  multiple: true,
  schema: {
      radius: {default: 1},
      event: {default: 'trigger'}
  },
  init: function() {
      // we don't know yet where we are
      this.teststateset = false;
      this.laststateinthetrigger = false;
      this.name = "";
  },
  update: function (oldData) {
      this.radiusSquared = this.data.radius * this.data.radius;
      this.name = this.id ? this.id : "";
  },
  tick: function() {
      // gathering all the data
      var data = this.data;
      var thisradiusSquared = this.radiusSquared;
      var triggereventname = data.event;
      var laststateset = this.laststateset;
      var laststateinthetrigger = this.laststateinthetrigger;
      var camera = this.el.sceneEl.camera;

      // camera might not be set immediately
      if (!camera) { return; }

      var cameraPosition = camera.position;
      //var position = this.el.getComputedAttribute('position');
      // we don't want the attribute value, we want the "real" value
      var distanceSquared = this.el.object3D.position.distanceToSquared(cameraPosition);

      if (distanceSquared <= thisradiusSquared) {
      	// we are in
        if (laststateset){
	        // we were not before
          if (!laststateinthetrigger) {
            this.el.emit(triggereventname, {name: this.name, inside: true, distanceSquared: distanceSquared});
          }
        }
        this.laststateinthetrigger = true;
      } else {
      	// we are out
        if (laststateset){
          if (laststateinthetrigger) {
	          // we were not before
            this.el.emit(triggereventname, {name: this.name, inside: false, distanceSquared: distanceSquared});
          }
        }
        this.laststateinthetrigger = false;
      }
      this.laststateset = true;
  },

});

