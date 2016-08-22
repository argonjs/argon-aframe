(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../src/ar-scene.js');
require('../src/ar-components.js');
require('../src/ar-referenceframe.js');
require('../src/css-object.js');
require('../src/ar-vuforia.js');
require('../src/shadow-material.js');
},{"../src/ar-components.js":2,"../src/ar-referenceframe.js":3,"../src/ar-scene.js":4,"../src/ar-vuforia.js":5,"../src/css-object.js":6,"../src/shadow-material.js":7}],2:[function(require,module,exports){
var zeroScale = 0.00001;

AFRAME.registerComponent('fixedsize', {
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

    // if distance < near clipping plane, just use scale.  Don't go any bigger
    var factor = distance < camera.near ? this.scale : distance * this.scale;
    object3D.scale.set(factor, factor, factor);
  }
});

AFRAME.registerComponent('trackvisibility', {
  schema: { 
    default: true
  },

  init: function () {
    var self = this;
    console.log("INIT TEST COMPONENT");
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
    console.log("updated TEST COMPONENT")
  }
}); 
},{}],3:[function(require,module,exports){
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

        // this component only works with an Argon Scene
        if (!el.sceneEl.isArgon) {
            throw new Error('referenceframe must be used on a child of a <ar-scene>.');
        }
	   this.localRotationEuler = new THREE.Euler(0,0,0,'XYZ');
       this.localPosition = { x: 0, y: 0, z: 0 };
       this.localScale = { x: 1, y: 1, z: 1 };
       this.knownFrame = false;
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
            this.localRotationEuler.x = degToRad(lo.x);
            this.localRotationEuler.y = degToRad(lo.y);
            this.localRotationEuler.z = degToRad(lo.z);
        } else {
            this.localRotationEuler.x = 0;
            this.localRotationEuler.y = 0;
            this.localRotationEuler.z = 0;
        }

        var ls = el.getComputedAttribute('scale');
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
                    el.sceneEl.emit('referenceframe-statuschanged', {
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
                } 
            } else {
                this.knownFrame = false;
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

},{}],4:[function(require,module,exports){
var AEntity = AFRAME.AEntity;
var ANode = AFRAME.ANode;

var AR_CAMERA_ATTR = "data-aframe-argon-camera";

var style = document.createElement("style");
style.type = 'text/css';
document.head.insertBefore(style, document.head.firstChild);
var sheet = style.sheet;
sheet.insertRule('ar-scene {\n' + 
'  display: block;\n' +
'  position: relative;\n' +
'  height: 100%;\n' +
'  width: 100%;\n' +
'}\n', 0);
sheet.insertRule('\n' +
'ar-scene video,\n' +
'ar-scene img,\n' +
'ar-scene audio {\n' +
'  display: none;\n' +
'}\n', 1);

// want to know when the document is loaded 
document.DOMReady = function () {
	return new Promise(function(resolve, reject) {
		if (document.readyState === 'complete') {
			resolve(document);
		} else {
			document.addEventListener('DOMContentLoaded', function() {
			    resolve(document);
		    });
		}
	});
};

AFRAME.registerElement('ar-scene', {
  prototype: Object.create(AEntity.prototype, {
//    defaultComponents: {
//       value: {
//         'camera': ''
//       }
//     },
    
    createdCallback: {
      value: function () {
        this.isMobile = AFRAME.utils.isMobile();
        this.isIOS = AFRAME.utils.isIOS();
        this.isScene = true;
        this.isArgon = true;        
        this.object3D = new THREE.Scene();
        this.systems = {};
        this.time = 0;
  //      this.startTime = 0;
        this.argonApp = null;

        // finish initializing
        this.init();
      }
    },

    init: {
      value: function () {
        this.behaviors = [];
        this.hasLoaded = false;
        this.isPlaying = false;
        this.originalHTML = this.innerHTML;

        // let's initialize argon immediately, but wait till the document is
        // loaded to set up the DOM parts
        this.argonApp = Argon.init();
        this.argonApp.context.setDefaultReferenceFrame(this.argonApp.context.localOriginEastUpSouth);

        this.argonRender = this.argonRender.bind(this);
        this.argonUpdate = this.argonUpdate.bind(this);
        this.initializeArgon = this.initializeArgon.bind(this);
        this.setupRenderer = this.setupRenderer.bind(this);
     //   this.rAFRenderFunc = this.rAFRenderFunc.bind(this);

        // var arCameraEl = this.arCameraEl = document.createElement('a-entity');
        // arCameraEl.setAttribute(AR_CAMERA_ATTR, '');
        // arCameraEl.setAttribute('camera', {'active': true});
        // this.sceneEl.appendChild(arCameraEl);

        // run this whenever the document is loaded, which might be now
        document.DOMReady().then(this.initializeArgon);
        //this.initializeArgon();
      },
      writable: true 
    },

    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    attachedCallback: {
      value: function () {        
        this.setupSystems();
        this.play();
      },
      writable: window.debug
    },

    addEventListeners: {
        value: function () {
            this.argonApp.renderEvent.addEventListener(this.argonRender);
            this.argonApp.updateEvent.addEventListener(this.argonUpdate);
        },
        writable: true
    },

    removeEventListeners: {
        value: function () {
            this.argonApp.updateEvent.removeEventListener(this.argonUpdate);
            this.argonApp.renderEvent.removeEventListener(this.argonRender);
        },
        writable: true
    },
    
    play: {
      value: function () {
        var sceneEl = this.sceneEl;
        var self = this;

        if (this.renderStarted) {
          AEntity.prototype.play.call(this);
          return;
        }

        this.addEventListener('loaded', function () {
          if (this.renderStarted) { return; }

          if (!this.camera || this.camera.el.tagName !== "AR-CAMERA") {
              var defaultCameraEl = document.createElement('ar-camera');
              defaultCameraEl.setAttribute(AR_CAMERA_ATTR, '');
              sceneEl.appendChild(defaultCameraEl);
          }

          if (this.argonApp) {
              sceneEl.addEventListeners();
          } else {
            this.addEventListener('argon-initialized', function() {
              self.addEventListeners();
            });
          }

          AEntity.prototype.play.call(this);

          if (window.performance) {
              window.performance.mark('render-started');
          }

          this.renderStarted = true;
          this.emit('renderstart');
        });

        // setTimeout to wait for all nodes to attach and run their callbacks.
        setTimeout(function () {
          AEntity.prototype.load.call(self);
        });
      }
    },

    /**
     * Shuts down scene on detach.
     */
    detachedCallback: {
      value: function () {
          if (this.animationFrameID) {
            cancelAnimationFrame(this.animationFrameID);
            this.animationFrameID = null;
          }
          removeEventListenern();
      }
    },

    initializeArgon: {
        value: function () {
            // Moved this above!

            // this.argonApp = Argon.init();
            // this.argonApp.context.setDefaultReferenceFrame(this.argonApp.context.localOriginEastUpSouth);

            this.setupRenderer();

            // if we've already initialized the rendering, we won't have
            // set these callbacks, so do it now
            // if (this.renderStarted) {
            //     this.addEventListens();
            // }

            this.emit('argon-initialized', {
                target: this.argonApp
            });
            
        },
        writable: true
    },

    setupRenderer: {
      value: function () {        
        var antialias = this.getAttribute('antialias') === 'true';

        if (THREE.CSS3DArgonRenderer) {
          this.cssRenderer = new THREE.CSS3DArgonRenderer();
        } else {
          this.cssRenderer = null;
        }
        if (THREE.CSS3DArgonHUD) {
          this.hud = new THREE.CSS3DArgonHUD();
        } else {
          this.hud = null;
        }
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: antialias,
            logarithmicDepthBuffer: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.argonApp.view.element.appendChild(this.renderer.domElement);
        if (this.cssRenderer) {
          this.argonApp.view.element.appendChild(this.cssRenderer.domElement);
        }
        if (this.hud) {
          this.argonApp.view.element.appendChild(this.hud.domElement);
        }
      },
      writable: true
    },


    /**
     * Reload the scene to the original DOM content.
     *
     * @param {bool} doPause - Whether to reload the scene with all dynamic behavior paused.
     */
    reload: {
      value: function (doPause) {
        var self = this;
        if (doPause) { this.pause(); }
        this.innerHTML = this.originalHTML;
        this.init();
        ANode.prototype.load.call(this, play);
        function play () {
          if (!self.isPlaying) { return; }
          AEntity.prototype.play.call(self);
        }
      }
    },

    /**
     * Behavior-updater meant to be called from scene render.
     * Abstracted to a different function to facilitate unit testing (`scene.tick()`) without
     * needing to render.
     */
    argonUpdate: {
        value: function (frame) {
            var time = frame.systemTime;
            var timeDelta = frame.deltaTime;

            if (this.isPlaying) {
                this.tick(time, timeDelta);
            }

            this.time = time;   
        },
        writable: true
    },

    tick: {
      value: function (time, timeDelta) {
        var systems = this.systems;

        // Animations.
        TWEEN.update(time);

        // Components.
        this.behaviors.forEach(function (component) {
            if (!component.el.isPlaying) { return; }
            component.tick(time, timeDelta);
        });
        // Systems.
        Object.keys(systems).forEach(function (key) {
            if (!systems[key].tick) { return; }
            systems[key].tick(time, timeDelta);
        });
      }
    },

    /**
     * The render loop.
     *
     * Updates animations.
     * Updates behaviors.
     * Renders with request animation frame.
     */
    argonRender: {
       value: function (frame) {
        if (!this.animationFrameID) {
          var app = this.argonApp;

          this.rAFviewport = app.view.getViewport();
          this.rAFsubViews = app.view.getSubviews();
          this.animationFrameID = requestAnimationFrame(this.rAFRenderFunc.bind(this));
        }
      },
      writable: true 
    },

    rAFviewport: {
      value: null,
      writable: true
    },
    rAFsubViews: {
      value: null,
      writable: true
    },

    rAFRenderFunc: {
      value: function () {
        var scene = this.object3D;
        var renderer = this.renderer;
        var cssRenderer = this.cssRenderer;
        var hud = this.hud;
        var camera = this.camera;

        if (!this.renderer) {
          // renderer hasn't been setup yet
          this.animationFrameID = null;
          return;
        }

        // the camera object is created from a camera property on an entity. This should be
        // an ar-camera, which will have the entity position and orientation set to the pose
        // of the user.  We want to make the camera pose 
        var camEntityPos = null;
        var camEntityRot = null;
        if (camera.parent) {
            camEntityPos = camera.parent.position.clone().negate();
            camEntityRot = camera.parent.quaternion.clone().inverse();
        }

        //var viewport = app.view.getViewport()
        var viewport = this.rAFviewport;
        renderer.setSize(viewport.width, viewport.height);
        if (this.cssRenderer) {
          cssRenderer.setSize(viewport.width, viewport.height);
        }
        if (this.hud) {
          hud.setSize(viewport.width, viewport.height);
        }

        // leverage vr-mode.  Question: perhaps we shouldn't, perhaps we should use ar-mode?
        // unclear right now how much of the components that use vr-mode are re-purposable
        //var _a = app.view.getSubviews();
        var _a = this.rAFsubViews;
        if (this.is('vr-mode')) {
          if (_a.length == 1) {
            this.removeState('vr-mode');
            this.emit('exit-vr', {target: this});
          } 
        } else {
          if (_a.length > 1) {
            this.addState('vr-mode');
            this.emit('enter-vr', {target: this});
          }
        }

        // set the camera properties to the values of the 1st subview.
        // While this is arbitrary, it's likely many of these will be the same
        // across all subviews, and it's better than leaving them at the 
        // defaults, which are almost certainly incorrect
        camera.near = _a[0].frustum.near;
        camera.far = _a[0].frustum.far;
        camera.aspect = _a[0].frustum.aspect;
        
        // there is 1 subview in monocular mode, 2 in stereo mode    
        for (var _i = 0; _i < _a.length; _i++) {
            var subview = _a[_i];
            var frustum = subview.frustum;
            
            // set the position and orientation of the camera for 
            // this subview
            camera.position.copy(subview.pose.position);
            if (camEntityPos)  { camera.position.add(camEntityPos); }
            camera.quaternion.copy(subview.pose.orientation);
            if (camEntityRot)  { camera.quaternion.multiply(camEntityRot); }

            // the underlying system provide a full projection matrix
            // for the camera. 
            camera.projectionMatrix.fromArray(subview.projectionMatrix);
            // set the viewport for this view
            var _b = subview.viewport, x = _b.x, y = _b.y, width = _b.width, height = _b.height;
            // set the CSS rendering up, by computing the FOV, and render this view
            
            if (this.cssRenderer) {
              //cssRenderer.updateCameraFOVFromProjection(camera);
              camera.fov = THREE.Math.radToDeg(frustum.fovy);
              
              cssRenderer.setViewport(x, y, width, height, subview.index);
              cssRenderer.render(scene, camera, subview.index);
            }

            // set the webGL rendering parameters and render this view
            renderer.setViewport(x, y, width, height);
            renderer.setScissor(x, y, width, height);
            renderer.setScissorTest(true);
            renderer.render(scene, camera);

            if (this.hud) {
              // adjust the hud
              hud.setViewport(x, y, width, height, subview.index);
              hud.render(subview.index);
            }
        }

        this.animationFrameID = null;
      },
      writable: true
    },


    /**
     * Some mundane functions below here
     */
    setupSystems: {
      value: function () {
        var systemsKeys = Object.keys(AFRAME.systems);
        systemsKeys.forEach(this.initSystem.bind(this));
      }
    },

    initSystem: {
      value: function (name) {
        var system;
        if (this.systems[name]) { return; }
        system = this.systems[name] = new AFRAME.systems[name](this);
        system.init();
      }
    },

    /**
     * @param {object} behavior - Generally a component. Must implement a .update() method to
     *        be called on every tick.
     */
    addBehavior: {
      value: function (behavior) {
        var behaviors = this.behaviors;
        if (behaviors.indexOf(behavior) !== -1) { return; }
        behaviors.push(behavior);
      }
    },

    /**
     * Wraps Entity.getAttribute to take into account for systems.
     * If system exists, then return system data rather than possible component data.
     */
    getAttribute: {
      value: function (attr) {
        var system = this.systems[attr];
        if (system) { return system.data; }
        return AEntity.prototype.getAttribute.call(this, attr);
      }
    },

    /**
     * Wraps Entity.getComputedAttribute to take into account for systems.
     * If system exists, then return system data rather than possible component data.
     */
    getComputedAttribute: {
      value: function (attr) {
        var system = this.systems[attr];
        if (system) { return system.data; }
        return AEntity.prototype.getComputedAttribute.call(this, attr);
      }
    },

    /**
     * Wraps Entity.setAttribute to take into account for systems.
     * If system exists, then skip component initialization checks and do a normal
     * setAttribute.
     */
    setAttribute: {
      value: function (attr, value, componentPropValue) {
        var system = this.systems[attr];
        if (system) {
          ANode.prototype.setAttribute.call(this, attr, value);
          return;
        }
        AEntity.prototype.setAttribute.call(this, attr, value, componentPropValue);
      }
    },

    /**
     * @param {object} behavior - Generally a component. Has registered itself to behaviors.
     */
    removeBehavior: {
      value: function (behavior) {
        var behaviors = this.behaviors;
        var index = behaviors.indexOf(behavior);
        if (index === -1) { return; }
        behaviors.splice(index, 1);
      }
    }
    
  })
});

AFRAME.registerPrimitive('ar-camera', {
  defaultComponents: {
    camera: {active: true},
    referenceframe: {parent: 'ar.user'}
  }
});

},{}],5:[function(require,module,exports){
AFRAME.registerSystem('vuforia', {
    init: function () {
        this.key = "";
        this.api = null;
        this.datasetMap = {};
        this.available = false;

        this.sceneEl.addEventListener('argon-initialized', this.startVuforia.bind(this));
    },

    setKey: function (key) {
        this.key = key;

        if (this.sceneEl.argonApp) {
            this.startVuforia();
        }
    },

    startVuforia: function() {
        var self = this;
        var sceneEl = this.sceneEl;
        var argonApp = sceneEl.argonApp;

        // need argon
        if (!argonApp) { return; }

        // if there is no vuforia API, bye bye
        if (!argonApp.vuforia) { return; }

        // if already initialized, bye bye
        if (this.api) { return; }

        // can't initialize if we don't have the key yet
        if (this.key === "") { return; }

        // try to initialize
        argonApp.vuforia.isAvailable().then(function(available) {
            if (self.available) {
                // this code has already run, through to telling argon to initialize vuforia!
                return;
            }

            // vuforia not available on this platform
            if (!available) {
                self.available = false;
                console.warn('vuforia not available on this platform.');

                // in case an application wants to take action when vuforia isn't supported
                sceneEl.emit('argon-vuforia-not-available', {
                    target: sceneEl
                });                            
                return;
            } 

            // vuforia is available!
            self.available = true;

            // try to initialize with our key
            argonApp.vuforia.init({
                //licenseKey: self.key
                encryptedLicenseData: self.key
            }).then(function(api) {
                // worked! Save the API
                self.api = api;

                console.log("vuforia initialized!")

                // re-call createOrUpdateDataset to create datasets already requested
                Object.keys(self.datasetMap).forEach(function(key,index) {
                    var dataset = self.datasetMap[key];
                    console.log("re-initializing dataset " + key + " as active=" + dataset.active);
                    self.createOrUpdateDataset(dataset.component, key, dataset.url, dataset.active)
                });

                // tell everyone the good news
                sceneEl.emit('argon-vuforia-initialized', {
                    target: sceneEl
                });                            
            }).catch(function(err) {
                console.log("vuforia failed to initialize: " + err.message);

                sceneEl.emit('argon-vuforia-initialization-failed', {
                    target: sceneEl,
                    error: err
                });                                            
            });
        });
    },

    // create an empty dataset
    createEmptyDatasetObject: function () {
        return {
            component: null,
            api: null, 
            url: null, 
            fetched: false,
            loaded: false, 
            active: false, 
            targets: {},
            trackables: null,
            initInProgress: false
        };
    },

    // create a new dataset or update one currently created.  
    createOrUpdateDataset: function (component, name, url, active) {
        var self = this;
        var api = this.api;
        var dataset = this.datasetMap[name];

        // if dataset exists, and matches the previous element, it's because targets were registered before the 
        // dataset was set up, which is fine.  Otherwise, its a duplicate dataset name, which isn't allowed!
        if (dataset) {
          if (dataset.component) {
            if (dataset.component != component) {
                console.warn('vuforia.createOrUpdateDataset called multiple times for id=' + name + ', ignoring extra datasets');
                return;
            }   
            if (dataset.url != url) {
                console.warn("can't change the url for a vuforia dataset once it's created.  Ignoring new URL '" + url + "' for dataset '" + name + "'")
                return;
            }
          } else {
            // first time this has been called, the dataset is there
            // because of calls to set up targets, etc.
            dataset.component = component;
            dataset.url = url;
          }
        } else {
            // set up the mapping if not there
            dataset = this.datasetMap[name] = this.createEmptyDatasetObject();
            dataset.component = component;
            dataset.url = url;
        }

        dataset.active = active;

        console.log("creating dataset " + name + " active=" + active );

        // if vuforia has not yet initialized, return.  
        if (!api) {
            return;
        }

        if (dataset.initInProgress) {
            // just update the active flag, will get dealt with when fetch is done
            dataset.active = active;
            return;
        }

        // if the api is initialized, deal with the active state
        if (dataset.api) {
            dataset.active = active;

            // if already fetched, update the active state
            if (fetched) {
                self.setDatasetActive(name, dataset.active);
            }
            return;
        }

        console.log("objectTracker.createDataSet " + name );

        dataset.initInProgress = true;
        // should have both vuforia and argon initialized by now
        api.objectTracker.createDataSet(url).then(function (data) {
            console.log("created dataset " + name );

            dataset.initInProgress = false;
            dataset.api = data; 
            data.fetch().then(function () {

                console.log("fetched dataset " + name );

                dataset.fetched = true;

                console.log("now, re-activate dataset " + name + " active=" + dataset.active );
                self.setDatasetActive(name, dataset.active);
                dataset.component.datasetLoaded = true;
                console.log("re-activated dataset " + name + " active=" + dataset.active );
                
                // tell everyone the good news
                self.sceneEl.emit('argon-vuforia-dataset-downloaded', {
                    target: dataset.component
                });                            
            }).catch(function(err) {
                console.log("couldn't download dataset: " + err.message);

                sceneEl.emit('argon-vuforia-dataset-download-failed', {
                    target: sceneEl,
                    error: err
                });                                            
            });
        });
    },

    setDatasetActive: function (name, active) {
        var self = this;
        var api = this.api;
        var dataset = this.datasetMap[name];

        console.log("make dataset " + name + " active=" +active );

        if (!api) {
            if (dataset) {
                dataset.active = active;
                return;
            } else {
                throw new Error('vuforia.setDatsetActive call before dataset initialized');
            }
        }
        
        if (!dataset) {
            throw new Error('ar-vuforia-dataset "' + name + '" should have been created before being activated');
        }

        console.log("really making dataset " + name + " active=" +active );

        if (!dataset.loaded && active) {
            console.log("loading dataset " + name + " active=" +active );
            dataset.api.load().then(function () {
                console.log("loaded dataset " + name + " active=" +active );
                if (dataset.loaded) { return; }

                dataset.loaded = true;
                dataset.fetched = true;
                dataset.trackables = dataset.api.getTrackables();
                if (active) {
                    dataset.active = true;
                    api.objectTracker.activateDataSet(dataset.api);
                }

                // re-call subscribeToTarget to subscribe the targets already requested
                Object.keys(dataset.targets).forEach(function(key,index) {
                    console.log("re-subscribing to target " + name + "." + key );
                    self.subscribeToTarget(name, key, true);
                });

                // tell everyone the good news
                self.sceneEl.emit('argon-vuforia-dataset-loaded', {
                    target: dataset.component
                });               
                console.log("dataset " + name + " loaded, ready to go");         
            }).catch(function(err) {
                console.log("couldn't load dataset: " + err.message);

                sceneEl.emit('argon-vuforia-dataset-load-failed', {
                    target: sceneEl,
                    error: err
                });                                            
            });
        } else {
            if (dataset.active != active) {
                dataset.active = active;
                if (active) {
                    api.objectTracker.activateDataSet(dataset.api);
                } else {
                    api.objectTracker.deactivateDataSet(dataset.api);                
                }
            }
        }        
    },

    subscribeToTarget: function (name, target, postLoad) {
        var api = this.api;
        var dataset = this.datasetMap[name];

        // set up the mapping if not there
        if (!dataset) {
            dataset = this.datasetMap[name] = this.createEmptyDatasetObject();
        }
        
        // either create a new target entry and set the count, or add the count to an existing one
        targetItem = dataset.targets[target];
        if (!targetItem) {
            dataset.targets[target] = 1;
        } else if (!postLoad) {
            dataset.targets[target] += 1;
        }
        console.log("subscribe to " + name + "." + target)

        if (!api) { return null; }
            
        if (dataset.loaded) {
            var tracker = dataset.trackables[target];
            console.log("dataset loaded, subscribe to " + name + "." + target)
            if (tracker && tracker.id) {
                console.log("subscribed to " + name + "." + target + " as " + tracker.id)
                return this.sceneEl.argonApp.context.subscribeToEntityById(tracker.id);
            } else {
                console.warn("can't subscribe to target '" + target + "' does not exist in dataset '" + name + "'");
                return null;
            }
        }
        // not loaded yet
        return null;
    },

    getTargetEntity: function (name, target) {
        var api = this.api;
        var dataset = this.datasetMap[name];
        var tracker;

        console.log("getTargetEntity " + name + "." + target)

        // set up the mapping if not there
        if (!api || !dataset || !dataset.loaded) {
            return null;
        }
        
        tracker = dataset.trackables[target];
        console.log("everything loaded, get " + name + "." + target)
        if (tracker && tracker.id) {
            console.log("retrieved " + name + "." + target + " as " + tracker.id)
            return this.sceneEl.argonApp.context.entities.getById(tracker.id);
        } else {
            console.warn("can't get target '" + target + "', does not exist in dataset '" + name + "'");
        }
        return null;
    }
});

// the parameter to vuforia is a reference to a element.
// If the element is an a-asset-item, the key should have been downloaded into its data property
// Otherwise, assume the key is in the innerHTML (contents) of the element
AFRAME.registerComponent('vuforiakey', {
    schema: { 
        default: " "
    },

    /**
     * Nothing to do
     */
    init: function () {
        this.key = null;
    },

    /** 
     * Update:  first time in, we initialize vuforia
     */
    update: function (oldData) {
        var el = this.el;
        var sceneEl = this.el.sceneEl;
        var system = sceneEl.systems["vuforia"];
            
        if (!el.isArgon) {
            console.warn('vuforia component can only be applied to <ar-scene>');
            return;
        }

        var keyAsset = el.querySelector(this.data);

        if (keyAsset) {
            if (keyAsset.isAssetItem) {
                this.key = keyAsset.data;
                system.setKey(keyAsset.data);
            } else {
                this.key = keyAsset.innerHTML;
                system.setKey(keyAsset.innerHTML);
            }
        } else {
            console.warn('vuforia component cannot find asset "' + this.data + '"');
            return;
        }
    }
});

AFRAME.registerComponent('vuforiadataset', {
    multiple: true,

    schema: {
        src: {type: 'src'},
        active: {default: true}
    },

    init: function () {
        var el = this.el;

        this.name = "default_dataset";
        this.active = false;
        this.datasetLoaded = false;

        if (!el.isArgon) {
            console.warn('vuforiadataset should be attached to an <ar-scene>.');
        }
    },

    remove: function () {
        if (this.active) {
            var sceneEl = this.el.sceneEl;
            var vuforia = sceneEl.systems["vuforia"];
            vuforia.setDatasetActive(this.name, false);
        }
        // remove dataset from system, when argon supports that
    },

    update: function (oldData) {
        var sceneEl = this.el.sceneEl;
        this.name = this.id ? this.id : "default_dataset";

        var vuforia = sceneEl.systems["vuforia"];
        vuforia.createOrUpdateDataset(this, this.name, this.data.src, this.data.active);
    }
});

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}]},{},[1]);
