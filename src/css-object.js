AFRAME.registerComponent('css-object', {
  schema: {
    div: { default: '' },
  },

  init: function () {
    this.div = null;
  },

  update: function () {
    var data = this.data;
    if (data.div === "") { return; }
    
    var div = document.querySelector(data.div);
    if (div) {
        if (THREE.CSS3DObject) {
          this.el.setObject3D('div', new THREE.CSS3DObject(div));
        }
    }
  },

  remove: function () {
    if (!this.div) { return; }

    if (THREE.CSS3DObject) {
      this.el.removeObject3D('div');
    }
  }
});
