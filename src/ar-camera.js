var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

/**
 * Camera component.
 * Pairs along with camera system to handle tracking the active camera.
 */
AFRAME.registerComponent('ar-camera', {
  schema: {
    active: { default: true },
    far: { default: 100000 },
    near: { default: 0.05, min: 0 }
  },

  /**
   * Initialize three.js camera and add it to the entity.
   * Add reference from scene to this entity as the camera.
   */
  init: function () {
    var camera = this.camera = new THREE.PerspectiveCamera();
    this.el.setObject3D('camera', camera);
  },

  /**
   * Remove camera on remove (callback).
   */
  remove: function () {
    this.el.removeObject3D('camera');
  },

  /**
   * Update three.js camera.
   */
  update: function (oldData) {
    var el = this.el;
    var data = this.data;
    var camera = this.camera;
    var system = this.system;

    // Update properties.
    camera.far = data.far;
    camera.near = data.near;

    // Active property did not change.
    if (oldData && oldData.active === data.active) { return; }

    // If `active` property changes, or first update, handle active camera with system.
    if (data.active && system.activeCameraEl !== this.el) {
      // Camera enabled. Set camera to this camera.
      system.setActiveCamera(el);
    } else if (!data.active && system.activeCameraEl === this.el) {
      // Camera disabled. Set camera to another camera.
      system.disableActiveCamera();
    }
  }
});
