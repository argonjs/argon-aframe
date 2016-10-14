var Cesium = Argon.Cesium;
var Cartesian3 = Cesium.Cartesian3;
var ConstantPositionProperty = Cesium.ConstantPositionProperty;
var ReferenceFrame = Cesium.ReferenceFrame;
var ReferenceEntity = Cesium.ReferenceEntity;
var degToRad = THREE.Math.degToRad;

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
        lla: { type: 'vec3'},
        parent: { default: "FIXED" },
        userotation: { default: true},
        useposition: { default: true}
    },

    /**
     * Nothing to do
     */
    init: function () {
        var el = this.el;                   // entity
        var self = this;

        this.update = this.update.bind(this);

        if (!el.sceneEl) {
            console.warn('referenceFrame initialized but no sceneEl');
            this.finishedInit = false;
        } else {
            this.finishedInit = true;
        }

        // this component only works with an Argon Scene
        // (sometimes, el.sceneEl is undefined when we get here.  weird)
        if (el.sceneEl && !el.sceneEl.isArgon) {
            console.warn('referenceframe must be used on a child of a <ar-scene>.');
        }
	   this.localRotationEuler = new THREE.Euler(0,0,0,'XYZ');
       this.localPosition = { x: 0, y: 0, z: 0 };
       this.localScale = { x: 1, y: 1, z: 1 };
       this.knownFrame = false;
        el.addEventListener('componentchanged', this.updateLocalTransform.bind(this));

        if (el.sceneEl) {
            el.sceneEl.addEventListener('argon-initialized', function() {
                self.update(self.data);
            });            
        }
    },

    checkFinished: function () {
        if (!this.finishedInit) {
            this.finishedInit = true;
            this.update(this.data);
        }
    },

    /** 
     * Update 
     */
    update: function (oldData) {
        if (!this.el.sceneEl) { return; }

        var el = this.el;
        var argonApp = this.el.sceneEl.argonApp;
        var data = this.data;

        var lp = el.getAttribute('position');
        if (lp) {
            this.localPosition.x = lp.x;
            this.localPosition.y = lp.y;
            this.localPosition.z = lp.z;
        } else {
            this.localPosition.x = 0;
            this.localPosition.y = 0;
            this.localPosition.z = 0;
        }

        var lo = el.getAttribute('rotation');
        if (lo) {
            this.localRotationEuler.x = degToRad(lo.x);
            this.localRotationEuler.y = degToRad(lo.y);
            this.localRotationEuler.z = degToRad(lo.z);
        } else {
            this.localRotationEuler.x = 0;
            this.localRotationEuler.y = 0;
            this.localRotationEuler.z = 0;
        }

        var ls = el.getAttribute('scale');
        if (ls) {
            this.localScale.x = ls.x;
            this.localScale.y = ls.y;
            this.localScale.z = ls.z;
        } else {
            this.localScale.x = 1;
            this.localScale.y = 1;
            this.localScale.z = 1;
        }
        if (!argonApp) {
            return;
        }

        var cesiumPosition = null;
        if (this.attrValue.hasOwnProperty('lla'))  {
            if (data.parent !== 'FIXED') {
                console.warn("Using 'lla' with a 'parent' other than 'FIXED' is invalid. Ignoring parent value.");
                data.parent = 'FIXED';
            }
            cesiumPosition = Cartesian3.fromDegrees(data.lla.x, data.lla.y, data.lla.z);
        } else {
            cesiumPosition = Cartesian3.ZERO;
        }

        // parentEntity is either FIXED or another Entity or ReferenceEntity 
        var parentEntity = this.getParentEntity(data.parent);

        // The first time here, we'll create a cesium Entity.  If the id has changed,
        // we'll recreate a new entity with the new id.
        // Otherwise, we just update the entity's position.
        if (this.cesiumEntity == null || (el.id !== "" && el.id !== this.cesiumEntity.id)) {
            var options = {
                position: new ConstantPositionProperty(cesiumPosition, parentEntity),
                orientation: Cesium.Quaternion.IDENTITY
            }
            if (el.id !== '') {
                options.id = el.id;
            }
            this.cesiumEntity = new Cesium.Entity(options);
        } else {
            this.cesiumEntity.position.setValue(cesiumPosition, parentEntity);
        }        
    },

    getParentEntity: function (parent) {
        var el = this.el;
        var self = this;
        var argonApp = this.el.sceneEl.argonApp;

        var parentEntity = null;

        if (parent === 'FIXED') {
            parentEntity = ReferenceFrame.FIXED;
        } else {
            var vuforia = el.sceneEl.systems["vuforia"];
            if (vuforia) {
                var parts = parent.split(".");
                if (parts.length === 3 && parts[0] === "vuforia") {
                    // see if it's already a known target entity
                    console.log("looking for target '" + parent + "'");
                    
                    parentEntity = vuforia.getTargetEntity(parts[1], parts[2]);

                    // if not known, subscribe to it
                    if (parentEntity === null) {
                        console.log("not found, subscribing to target '" + parent + "'");
                        parentEntity = vuforia.subscribeToTarget(parts[1], parts[2]);
                    }

                    // if still not known, try again when our dataset is loaded
                    if (parentEntity === null) {
                        console.log("not loaded, waiting for dataset for target '" + parent + "'");
                        var name = parts[1];
                        el.sceneEl.addEventListener('argon-vuforia-dataset-loaded', function(evt) {
                            console.log('dataset loaded.');
                            console.log("dataset name '" + evt.detail.target.name + "', our name '" + name + "'");
                            if (evt.detail.target.name === name) {
                                self.update(self.data);
                            }
                        });            
                        console.log("finished setting up to wait for dataset for target '" + parent + "'");
                    }
                }
            }

            // if it's a vuforia refernece frame, we might have found it above.  Otherwise, look for 
            // an entity with the parent ID
            if (!parentEntity) {
                parentEntity = argonApp.context.entities.getById(parent);
            }
            // If we didn't find the entity at all, create it
            if (!parentEntity) {
                parentEntity = new ReferenceEntity(argonApp.context.entities, parent);
            }
        }    
        return parentEntity;
    },

    convertReferenceFrame: function (newParent) {
        var el = this.el;                   // entity

        // can't do anything without a cesium entity
        if (!this.cesiumEntity)  { 
            console.warn("Tried to convertReferenceFrame on element '" + el.id + "' but no cesiumEntity initialized on that element");
            return; 
        }

        // eventually we'll convert the current reference frame to a new one, keeping the pose the same
        // but a bunch of changes are needed above to make this work

    },

  updateLocalTransform: function (evt) {
      var data = evt.detail.newData;
      if (evt.target != this.el) { return; }

      if (evt.detail.name == 'rotation') {
          this.localRotationEuler.x = degToRad(data.x);
          this.localRotationEuler.y = degToRad(data.y);
          this.localRotationEuler.z = degToRad(data.z);
      } else if (evt.detail.name == 'position') {
          this.localPosition.x = data.x;
          this.localPosition.y = data.y;
          this.localPosition.z = data.z;
      } else if (evt.detail.name == 'scale') {
          this.localScale.x = data.x;
          this.localScale.y = data.y;
          this.localScale.z = data.z;
      }
  },

  /**
   * update each time step.
   */
  tick: function () {      
      var m1 = new THREE.Matrix4();

      return function(t) {
        this.checkFinished();

        var data = this.data;               // parameters
        var el = this.el;                   // entity
        var object3D = el.object3D;
        var matrix = object3D.matrix;
        var argonApp = el.sceneEl.argonApp;
        var isNestedEl = !el.parentEl.isScene;

        if (!argonApp) { return };

        if (this.cesiumEntity) { 
            var entityPos = argonApp.context.getEntityPose(this.cesiumEntity);
            if (entityPos.poseStatus & Argon.PoseStatus.KNOWN) {
                this.knownFrame = true;
                if (data.userotation) {
                    object3D.quaternion.copy(entityPos.orientation);
                } else if (isNestedEl) {
                    object3D.rotation.copy(this.localRotationEuler);
                    object3D.rotation.order = 'YXZ';
                }
                if (data.useposition) {
                    object3D.position.copy(entityPos.position);
                } else if (isNestedEl) {
                    object3D.position.copy(this.localPosition);                    
                }
                if (entityPos.poseStatus & Argon.PoseStatus.FOUND) {
                    console.log("reference frame changed to FOUND");            
                    el.emit('referenceframe-statuschanged', {
                        target: this.el,
                        found: true
                    });                            
                }

                // if this isn't a child of the scene, move it to world coordinates
                if (!el.parentEl.isScene) {
                    object3D.scale.set(1,1,1);
                    el.parentEl.object3D.updateMatrixWorld();
                    m1.getInverse(el.parentEl.object3D.matrixWorld);
                    matrix.premultiply(m1);
                    matrix.decompose(object3D.position, object3D.quaternion, object3D.scale );
                    object3D.updateMatrixWorld();
                } 
            } else {
                this.knownFrame = false;
                if (entityPos.poseStatus & Argon.PoseStatus.LOST) {
                    console.log("reference frame changed to LOST");            
                    el.emit('referenceframe-statuschanged', {
                        target: this.el,
                        found: false
                    });                            
                }
            }
        }
      };
  }()
});

AFRAME.registerPrimitive('ar-geopose', {
  defaultComponents: {
    referenceframe: {}
  },

  mappings: {
    lla: 'referenceframe.lla',
	userotation: 'referenceframe.userotation',
    useposition: 'referenceframe.useposition'
  }
});

AFRAME.registerPrimitive('ar-frame', {
  defaultComponents: {
    referenceframe: {}
  },

  mappings: {
    parent: 'referenceframe.parent',
	userotation: 'referenceframe.userotation',
    useposition: 'referenceframe.useposition'
  }
});
