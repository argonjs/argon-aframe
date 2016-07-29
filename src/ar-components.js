
AFRAME.registerComponent('tracktargetvisibilty', {
  schema: { default: true },

  init: function () {
        this.el.addEventListener('referenceframe-statuschanged', 
                                 this.updateVisibility.bind(this));
  },

  update: function () {
  },

  updateVisibility: function (evt) {
      if (this.data && evt.detail.target === this.el) {
          this.el.object3D.visible = evt.detail.found;
      }
  }
});


AFRAME.registerComponent('scalewithdistance', {
  schema: { 
    default: 1
  },

  init: function () {
      this.scale = 1;
  },

  update: function () {
    var data = this.data;
    this.scale = data === 0 ? zeroScale : data;
  },

  tick: function (t) {
    var object3D = this.el.object3D;
    var camera = this.el.sceneEl.camera;
    var cameraPos = camera.getWorldPosition();
    var thisPos = object3D.getWorldPosition();
    var distance = thisPos.distanceTo(cameraPos);

    var factor = distance * this.scale;
    object3D.scale.set(factor, factor, factor);
  }
});
