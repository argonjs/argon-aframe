const Cesium = Argon.Cesium;
const Cartesian3 = Cesium.Cartesian3;
const JulianDate = Cesium.JulianDate;
const CesiumMath = Cesium.CesiumMath;
const Transforms = Cesium.Transforms;
const WGS84 = Cesium.Ellipsoid.WGS84;
const ConstantPositionProperty = Cesium.ConstantPositionProperty;
const ReferenceFrame = Cesium.ReferenceFrame;
const ReferenceEntity = Cesium.ReferenceEntity;

// AFRAME.registerComponent('lla'), {

// });

// AFRAME.registerSystem('referenceframe', {

// });

/**
 * referenceframe component for A-Frame.
 * 
 * Use an Argon reference frame as the coordinate system for the position and 
 * orientation for this entity.  The position and orientation components are
 * expressed relative to this frame. 
 * 
 * By default, it uses both the position and orientation of the reference frame
 * to define a coordinate frame for this entity, but either may be ignored, in which 
 * case the identity will be used. This is useful, for example, if you wish to have
 * this entity follow the position of a referenceframe but be oriented in the 
 * coordinates of its parent (typically scene coordinates). 
 * 
 * Known frames include ar.user, ar.device, ar.localENU, ar.localEUS, 
 * ar.device.orientation, ar.device.geolocation, ar.device.display
 */
AFRAME.registerComponent('referenceframe', {
    schema: { 
        id: { type: 'string'},
        lla: { type: 'vec3'},
        parentFrame: { default: "FIXED" },
        useRotation: { default: true},
        usePosition: { default: true}
    },

    /**
     * Nothing to do
     */
    init: function () {
        var el = this.el;                   // entity

        // this component only works with an Argon Scene
        if (!this.el.sceneEl.argonApp) {
            throw new Error('referenceframe must be used on a child of a <ar-scene>.');
        }
	    this.localRotationEuler = new THREE.Euler(0,0,0,'XYZ');
        this.localPosition = { x: 0, y: 0, z: 0 };
        this.localMatrix = new THREE.Matrix4();
    },

    /** 
     * Update 
     */
    update: function (oldData) {
        var el = this.el;
        var argonApp = this.el.sceneEl.argonApp;
        var data = this.data;

        var lp = el.getComputedAttribute('position');
        var lo = el.getComputedAttribute('rotation');

        this.localPosition.x = lp.x;
        this.localPosition.y = lp.y;
        this.localPosition.z = lp.z;
        this.localRotationEuler.x = lo.x;
        this.localRotationEuler.y = lo.y;
        this.localRotationEuler.z = lo.z;
        this.localMatrix.makeRotationFromEuler(this.localRotationEuler);
        this.localMatrix.setPosition(this.localPosition);

        var cesiumPosition = null;
        var lla = el.getAttribute("lla");
//        if (!(data.lla.x === 0 && data.lla.y === 0 && data.lla.z === 0) && data.parentFrame !== 'FIXED') {
        if (lla !== null && data.parentFrame !== 'FIXED') {
            console.warn("Using 'lla' with a 'parentFrame' other than 'FIXED' is invalid. Ignoring parentFrame value.");
            data.parentFrame = 'FIXED';
            cesiumPosition = Cartesian3.fromDegrees(data.lla.x, data.lla.y, data.lla.z);
        } else {
            cesiumPosition = Cartesian3.ZERO;
        }

        // parentEntity is either FIXED or another Entity or ReferenceEntity 
        var parentEntity;
        if (data.parentFrame === 'FIXED') {
            parentEntity = ReferenceFrame.FIXED;
        } else {
            parentEntity = argonApp.context.entities.getById(this.data.parentFrame);
            if (!parentEntity) {
                parentEntity = new ReferenceEntity(argonApp.context.entities, 
                                                   this.data.parentFrame);
            }
        }

        // The first time here, we'll create a cesium Entity.  If the id has changed,
        // we'll recreate a new entity with the new id.
        // Otherwise, we just update the entity's position.
        if (this.cesiumEntity == null || data.id !== oldData.id) {
            var options = {
                position: new ConstantPositionProperty(cesiumPosition, parentEntity),
                orientation: Cesium.Quaternion.IDENTITY
            }
            if (this.data.id !== '') {
                options.id = this.data.id;
            }
            this.cesiumEntity = new Cesium.Entity(options);
        } else {
            this.cesiumEntity.position.setValue(cesiumPosition, parentEntity);
        }
        
        this.el.addEventListener('componentchanged', this.updateLocalTransform.bind(this));
    },

  updateLocalTransform: function (evt) {
      var el = this.el;
      var data = evt.detail.newData;

      if (evt.detail.name == 'rotation') {
          var lo = el.getComputedAttribute('rotation');
          this.localRotationEuler.x = lo.x;
          this.localRotationEuler.y = lo.y;
          this.localRotationEuler.z = lo.z;
      }
      else if (evt.detail.name == 'position') {
          var lp = el.getComputedAttribute('position');          
          this.localPosition.x = lp.x;
          this.localPosition.y = lp.y;
          this.localPosition.z = lp.z;
      }
      this.localMatrix.makeRotationFromEuler(this.localRotationEuler);
      this.localMatrix.setPosition(this.localPosition);
  },


  /**
   * update each time step.
   */
  tick: function () {
      var m1 = new THREE.Matrix4();
      var m2 = new THREE.Matrix4();

      return function(t) {
        var data = this.data;               // parameters
        var el = this.el;                   // entity
        var argonApp = el.sceneEl.argonApp;

        var entityPos = argonApp.context.getEntityPose(this.cesiumEntity);

        if (entityPos.poseStatus & Argon.PoseStatus.KNOWN) {
            if (data.useRotation) {
                el.object3D.matrix.makeRotationFromQuaternion(entityPos.orientation);
            } else {
                el.object3D.matrix.identity();
            }
            if (data.usePosition) {
                el.object3D.matrix.setPosition(entityPos.position);
            }
        } else {
            el.object3D.matrix.identity();
        }

        // if this isn't a child of the scene, move it to world coordinates
        if (!el.parentEl.isScene) {
            m1.getInverse(this.parentEl.Object3D.matrixWorld);
            el.object3D.matrix.preMultiply(m1);
        }

        // apply the local transformation, if any, specified by the rotation and 
        // position components
        el.object3D.applyMatrix(this.localMatrix);
      };
  }()
});
