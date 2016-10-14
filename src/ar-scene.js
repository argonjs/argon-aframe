var AEntity = AFRAME.AEntity;
var ANode = AFRAME.ANode;

var constants = require('../node_modules/aframe/src/constants/');

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
		if (document.readyState != 'loading') {
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
    defaultComponents: {
      value: {
        'canvas': '',
        'inspector': '',
        'keyboard-shortcuts': ''
      }
    },
    
    createdCallback: {
      value: function () {
        this.isMobile = AFRAME.utils.isMobile();
        this.isIOS = AFRAME.utils.isIOS();
        this.isScene = true;
        this.isArgon = true;        
        this.object3D = new THREE.Scene();
        this.systems = {};
        this.time = 0;
        this.argonApp = null;
        this.renderer = null;
        this.canvas = null;

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
        // loaded to set up the DOM parts.
        //
        // Check if Argon is already initialized, don't call init() again if so
        if (!Argon.ArgonSystem.instance) { 
            this.argonApp = Argon.init();
        } else {
            this.argonApp = Argon.ArgonSystem.instance;
        }

        this.argonApp.context.setDefaultReferenceFrame(this.argonApp.context.localOriginEastUpSouth);

        this.argonRender = this.argonRender.bind(this);
        this.argonUpdate = this.argonUpdate.bind(this);
        this.initializeArgonView = this.initializeArgonView.bind(this);

        this.addEventListener('render-target-loaded', function () {
          this.setupRenderer();
          // run this whenever the document is loaded, which might be now
          document.DOMReady().then(this.initializeArgonView);
        });
      },
      writable: true 
    },

    setupRenderer: {
      value: function () {      
        var canvas = this.canvas;

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
            canvas: canvas,
            alpha: true,
            antialias: antialias,
            logarithmicDepthBuffer: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
      },
      writable: true
    },

    initializeArgonView: {
        value: function () {
            // need to do this AFTER the DOM is initialized because 
            // the argon div may not be created yet, which will pull these 
            // elements out of the DOM, when they might be needed
            this.argonApp.view.element.appendChild(this.renderer.domElement);
            if (this.cssRenderer) {
              this.argonApp.view.element.appendChild(this.cssRenderer.domElement);
            }
            if (this.hud) {
              this.argonApp.view.element.appendChild(this.hud.domElement);
            }

            this.emit('argon-initialized', {
                target: this.argonApp
            });            
        },
        writable: true
    },

    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    attachedCallback: {
      value: function () {        
        this.initSystems();
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
        var self = this;

        if (this.renderStarted) {
          AEntity.prototype.play.call(this);
          return;
        }

        this.addEventListener('loaded', function () {
          if (this.renderStarted) { return; }

          var fixCamera = function () {
            var arCameraEl = null;
            var cameraEls = self.querySelectorAll('[camera]');
            for (i = 0; i < cameraEls.length; i++) {
                cameraEl = cameraEls[i];
                if (cameraEl.tagName === "AR-CAMERA") { 
                  arCameraEl = cameraEl;
                  continue; 
                }

                // work around the issue where if this entity was added during 
                // this sequence of loaded listeners, it will not yet have had
                // it's attachedCallback called, which means sceneEl won't yet
                // have been added in a-node.js.  When it's eventually added,
                // a-node will fire nodeready.  
                if (cameraEl.sceneEl) {
                  cameraEl.setAttribute('camera', 'active', false);
                  cameraEl.pause();
                } else {
                  var cameraToDeactivate = cameraEl;
                  cameraEl.addEventListener('nodeready', function() {
                    cameraToDeactivate.setAttribute('camera', 'active', false);
                    cameraToDeactivate.pause();
                  });
                }
            }

            if (arCameraEl == null) {
                var defaultCameraEl = document.createElement('ar-camera');
                defaultCameraEl.setAttribute(AR_CAMERA_ATTR, '');
                defaultCameraEl.setAttribute(constants.AFRAME_INJECTED, '');
                self.appendChild(defaultCameraEl);
            }
          }
          // if there are any cameras aside from the AR-CAMERA loaded, 
          // make them inactive.
          this.addEventListener('camera-set-active', fixCamera);
          fixCamera();
          
          if (this.argonApp) {
              self.addEventListeners();
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
          this.removeEventListeners();
      }
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
        
        if (!this.renderer || !this.camera) {
          // renderer hasn't been setup yet
          this.animationFrameID = null;
          return;
        }

        // the camera object is created from a camera property on an entity. This should be
        // an ar-camera, which will have the entity position and orientation set to the pose
        // of the user.  We want to make the camera pose 
        var camEntityPos = null;
        var camEntityRot = null;
        var camEntityInv = new THREE.Matrix4();

        if (camera.parent) {
            camera.parent.updateMatrixWorld();
            camEntityInv.getInverse(camera.parent.matrixWorld);
       //     camEntityPos = camera.parent.position.clone().negate();
         //   camEntityRot = camera.parent.quaternion.clone().inverse();
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
            //if (camEntityPos)  { camera.position.add(camEntityPos); }
            camera.quaternion.copy(subview.pose.orientation);
            //if (camEntityRot)  { camera.quaternion.multiply(camEntityRot); }
            camera.updateMatrix();
            camera.matrix.premultiply(camEntityInv);
            camera.matrix.decompose(camera.position, camera.quaternion, camera.scale );
            
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
    initSystems: {
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
     * `getAttribute` used to be `getDOMAttribute` and `getComputedAttribute` used to be
     * what `getAttribute` is now. Now legacy code.
     */
    getComputedAttribute: {
      value: function (attr) {
        warn('`getComputedAttribute` is deprecated. Use `getAttribute` instead.');
        this.getAttribute(attr);
      }
    },

    /**
     * Wraps Entity.getDOMAttribute to take into account for systems.
     * If system exists, then return system data rather than possible component data.
     */
    getDOMAttribute: {
      value: function (attr) {
        var system = this.systems[attr];
        if (system) { return system.data; }
        return AEntity.prototype.getDOMAttribute.call(this, attr);
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
    },

    resize: {
      value: function () {
        // don't need to do anything, just don't want components who call this to fail
      },
      writable: window.debug
    }
    
  })
});

AFRAME.registerPrimitive('ar-camera', {
  defaultComponents: {
    camera: {active: true},
    referenceframe: {parent: 'ar.user'}
  }
});
