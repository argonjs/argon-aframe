const Cesium = Argon.Cesium;
const Cartesian3 = Cesium.Cartesian3;
const ConstantPositionProperty = Cesium.ConstantPositionProperty;
const ReferenceFrame = Cesium.ReferenceFrame;
const ReferenceEntity = Cesium.ReferenceEntity;


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

        // this component only works with an Argon Scene
        if (!el.sceneEl.isArgon) {
            throw new Error('referenceframe must be used on a child of a <ar-scene>.');
        }
	    this.localRotationEuler = new THREE.Euler(0,0,0,'XYZ');
        this.localPosition = { x: 0, y: 0, z: 0 };
        this.localMatrix = new THREE.Matrix4();
        el.object3D.matrixAutoUpdate = false;
        el.addEventListener('componentchanged', this.updateLocalTransform.bind(this));
        el.sceneEl.addEventListener('argon-initialized', function() {
              self.update(self.data);
        });            
    },

    /** 
     * Update 
     */
    update: function (oldData) {
        var el = this.el;
        var self = this;
        var argonApp = this.el.sceneEl.argonApp;
        var data = this.data;

        var lp = el.getComputedAttribute('position');
        if (lp) {
            this.localPosition.x = lp.x;
            this.localPosition.y = lp.y;
            this.localPosition.z = lp.z;
        } else {
            this.localPosition.x = 0;
            this.localPosition.y = 0;
            this.localPosition.z = 0;
        }

        var lo = el.getComputedAttribute('rotation');
        if (lo) {
            this.localRotationEuler.x = lo.x;
            this.localRotationEuler.y = lo.y;
            this.localRotationEuler.z = lo.z;
        } else {
            this.localRotationEuler.x = 0;
            this.localRotationEuler.y = 0;
            this.localRotationEuler.z = 0;
        }

        this.localMatrix.makeRotationFromEuler(this.localRotationEuler);
        this.localMatrix.setPosition(this.localPosition);

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
        var parentEntity;
        if (data.parent === 'FIXED') {
            parentEntity = ReferenceFrame.FIXED;
        } else {
            var vuforia = el.sceneEl.systems["vuforia"];
            if (vuforia) {
                var parts = data.parent.split(".");
                if (parts.length === 3 && parts[0] === "vuforia") {
                    // see if it's already a known target entity
                    console.log("looking for target '" + data.parent + "'");
                    
                    parentEntity = vuforia.getTargetEntity(parts[1], parts[2]);

                    // if not known, subscribe to it
                    if (parentEntity === null) {
                        console.log("not found, subscribing to target '" + data.parent + "'");
                        parentEntity = vuforia.subscribeToTarget(parts[1], parts[2]);
                    }

                    // if still not known, try again when our dataset is loaded
                    if (parentEntity === null) {
                        console.log("not loaded, waiting for dataset for target '" + data.parent + "'");
                        var name = parts[1];
                        el.sceneEl.addEventListener('argon-vuforia-dataset-loaded', function(evt) {
                            console.log('dataset loaded.');
                            console.log("dataset name '" + evt.detail.target.name + "', our name '" + name + "'");
                            if (evt.detail.target.name === name) {
                                self.update(self.data);
                            }
                        });            
                        console.log("finished setting up to wait for dataset for target '" + data.parent + "'");
                    }
                }
            }

            // if it's a vuforia refernece frame, we might have found it above.  Otherwise, look for 
            // an entity with the parent ID
            if (!parentEntity) {
                parentEntity = argonApp.context.entities.getById(this.data.parent);
            }
            // If we didn't find the entity at all, create it
            if (!parentEntity) {
                parentEntity = new ReferenceEntity(argonApp.context.entities, 
                                                   this.data.parent);
            }
        }

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

  updateLocalTransform: function (evt) {
      var data = evt.detail.newData;

      if (evt.detail.name == 'rotation') {
          //var lo = el.getComputedAttribute('rotation');
          this.localRotationEuler.x = data.x;
          this.localRotationEuler.y = data.y;
          this.localRotationEuler.z = data.z;
      }
      else if (evt.detail.name == 'position') {
          //var lp = el.getComputedAttribute('position');          
          this.localPosition.x = data.x;
          this.localPosition.y = data.y;
          this.localPosition.z = data.z;
      }
      this.localMatrix.makeRotationFromEuler(this.localRotationEuler);
      this.localMatrix.setPosition(this.localPosition);
  },


  /**
   * update each time step.
   */
  tick: function () {
      var m1 = new THREE.Matrix4();

      return function(t) {
        var data = this.data;               // parameters
        var el = this.el;                   // entity
        var object3D = el.object3D;
        var matrix = object3D.matrix;
        var argonApp = el.sceneEl.argonApp;

        if (!argonApp) { 
            console.log("initial visibility set to false because argon not initialized");            
            el.sceneEl.emit('referenceframe-statuschanged', {
                    target: this.el,
                    found: false
            });                       
            // just use the local components, etc to create a transformation         
            object3D.updateMatrix();  
        } else if (this.cesiumEntity) { 
            var entityPos = argonApp.context.getEntityPose(this.cesiumEntity);
            if (entityPos.poseStatus & Argon.PoseStatus.KNOWN) {
                if (data.userotation) {
                    matrix.makeRotationFromQuaternion(entityPos.orientation);
                } else {
                    matrix.identity();
                }
                if (data.useposition) {
                    matrix.setPosition(entityPos.position);
                }
                if (entityPos.poseStatus & Argon.PoseStatus.FOUND) {
                    console.log("reference frame changed to FOUND");            
                    el.sceneEl.emit('referenceframe-statuschanged', {
                        target: this.el,
                        found: true
                    });                            
                }

                // if this isn't a child of the scene, move it to world coordinates
                if (!el.parentEl.isScene) {
                    m1.getInverse(el.parentEl.object3D.matrixWorld);
                    matrix.premultiply(m1);
                }
                // apply the local transformation, if any, specified by the rotation and 
                // position components
                matrix.multiply(this.localMatrix);
                matrix.decompose(object3D.position, object3D.quaternion, object3D.scale );

            } else {
                // el.object3D.matrix.identity();
                if (entityPos.poseStatus & Argon.PoseStatus.LOST) {
                    console.log("reference frame changed to LOST");            
                    el.sceneEl.emit('referenceframe-statuschanged', {
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
