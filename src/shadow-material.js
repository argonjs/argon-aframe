AFRAME.registerShader('shadow', {
  schema: {
  },

  /**
   * Initializes the shader.
   * Adds a reference from the scene to this entity as the camera.
   */
  init: function (data) {
    this.textureSrc = null;
    this.material = new THREE.ShadowMaterial();
    AFRAME.utils.material.updateMap(this, data);
  },

  update: function (data) {
    AFRAME.utils.material.updateMap(this, data);
  },
});
