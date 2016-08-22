AFRAME.registerComponent('css-object', {
  schema: {
    div: { default: '' },
    div2: { default: ''}
  },

  init: function () {
    this.div = null;
    this.div2 = null;
  },

  update: function () {
    var data = this.data;
    if (data.div === "") { return; }

    this.div = document.querySelector(data.div);
    if (data.div2 !== "") {
      this.div2 = document.querySelector(data.div2);
    }
    if (this.div) {
        if (THREE.CSS3DObject) {
          if (this.div2 === null) {
            this.el.setObject3D('div', new THREE.CSS3DObject(this.div));
          } else {
            this.el.setObject3D('div', new THREE.CSS3DObject([this.div, this.div2]));
          }
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
