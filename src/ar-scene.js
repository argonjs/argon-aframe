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
'  overflow: hidden;\n' +
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

var camEntityInv = new THREE.Matrix4();

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
        this.session = null; 

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
            this.argonApp = Argon.init(this);
        } else {
            this.argonApp = Argon.ArgonSystem.instance;
        }

        this.enableHighAccuracy = false;

        //this.argonApp.context.defaultReferenceFrame = this.argonApp.context.localOriginEastUpSouth;

        this.argonRender = this.argonRender.bind(this);
        this.argonUpdate = this.argonUpdate.bind(this);
        this.argonPresentChange = this.argonPresentChange.bind(this);

        this.argonChangeReality = this.argonChangeReality.bind(this);
        this.argonSessionChange = this.argonSessionChange.bind(this);
        this.argonApp.reality.changeEvent.addEventListener(this.argonChangeReality);
        this.argonApp.reality.connectEvent.addEventListener(this.argonSessionChange);

        this.initializeArgonView = this.initializeArgonView.bind(this);

        this.argonPresentChange();

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

        // Set at startup. To enable/disable antialias and logarithmicdepthbuffer
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var logarithmicDepthBuffer = this.getAttribute('logarithmicdepth') === 'true';

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
            antialias: antialias || window.hasNativeWebVRImplementation,
            logarithmicDepthBuffer: logarithmicDepthBuffer
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
            var layers = [ { source: this.renderer.domElement }];
            if (this.cssRenderer) {
              layers.push( { source: this.cssRenderer.domElement })
            }
            if (this.hud) {
              layers.push( { source: this.hud.domElement })
            }
            
            // set the layers of our view
            this.argonApp.view.setLayers(layers);

            this.argonPresentChange();

            this.emit('argon-initialized', {
                target: this.argonApp
            });            
        },
        writable: true
    },

    subscribeGeolocation: {
      value: function () {
        this.argonApp.context.subscribeGeolocation({enableHighAccuracy: this.enableHighAccuracy});
      }
    },
    
    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    attachedCallback: {
      value: function () {        
        this.initSystems();
        this.play();

        // Add to scene index.
        AFRAME.scenes.push(this);
      },
      writable: window.debug
    },

    addEventListeners: {
        value: function () {
            this.argonApp.renderEvent.addEventListener(this.argonRender);
            this.argonApp.updateEvent.addEventListener(this.argonUpdate);

            this.argonApp.device.presentHMDChangeEvent.addEventListener(this.argonPresentChange);
        },
        writable: true
    },

    argonSessionChange: {
      value: function (session) {
        this.session = session;
      },
      writable: true
    },

    setStageGeolocation: { 
      value: function(place) {
        if (this.session) {
          return this.argonApp.reality.setStageGeolocation(this.session, place);
        }
        return undefined;
      },
      writable: true
    },

    resetStageGeolocation: { 
      value: function() {
        if (this.session) {
          return this.argonApp.reality.resetStageGeolocation(this.session);
        }
        return undefined;
      },
      writable: true
    },


    argonChangeReality: {
      value: function () {
        // for now, we just revisit the presentation setup
        this.argonPresentChange();
      },
      writable: true
    },

    argonPresentChange: {
      value: function () {
        var device = this.argonApp.device;
        var reality = this.argonApp.reality;
        var visible = false;

        // AFrame already uses "vr-mode" to mean "isPresenting()" in WebVR, which means either
        // presenting on an HMD in WebVR, or on mobile w/ cardboard and the WebVR Polyfill
        //
        // While this isn't exactly what we want, we'll assume that this means "presenting in an HMD"
        // We'll add "AR" to signify that there is a version of Reality showing behind the content.
        // Again, while not precisely correct, it is ok. 
        console.log("-- checking presentation mode: " + (this.is('vr-mode')? "vr": "-") + (this.is('ar-mode')? " ar": " "))
        if (device.isPresentingHMD) {
          if (!this.is('vr-mode')) {
            this.addState('vr-mode');
            console.log('>> enter vr-mode');
            this.emit('enter-vr', {target: this});
          }

          // if we're in HMD mode, we determine AR mode from isPresentingRealityHMD
          if (device.isPresentingRealityHMD) {
            if (!this.is('ar-mode')) {
              this.addState('ar-mode');
              console.log('>> enter ar-mode');
              this.emit('enter-ar', {target: this});
            }
          } else {
            if (this.is('ar-mode')) {
              this.removeState('ar-mode');
              console.log('<< exit ar-mode');
              this.emit('exit-ar', {target: this});
            }
          }
        } else {
          if (this.is('vr-mode')) {
            this.removeState('vr-mode');
            console.log('<< exit vr-mode');
            this.emit('exit-vr', {target: this});
          }

          // if we're not in HMD mode, we determine AR mode based on the current reality.
          // the "empty" reality is not considered AR, which is the default reality on a 
          // browser than isn't see-through or can't display live video
          if (reality.current != Argon.RealityViewer.EMPTY) {
            if (!this.is('ar-mode')) {
              this.addState('ar-mode');
              console.log('>> enter ar-mode');
              this.emit('enter-ar', {target: this});
            }
          } else {
            if (this.is('ar-mode')) {
              this.removeState('ar-mode');
              console.log('<< exit ar-mode');
              this.emit('exit-ar', {target: this});
            }
          }
        }
      },
      writable: true
    },

    removeEventListeners: {
        value: function () {
            this.argonApp.updateEvent.removeEventListener(this.argonUpdate);
            this.argonApp.renderEvent.removeEventListener(this.argonRender);
            this.argonApp.device.presentChangeEvent.removeEventListener(this.argonPresentChange);
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

          // only do this once!
          this.renderStarted = true;

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
                  // wrap cameraToDeactivate so it's a separate variable each time
                  // through this loop
                  var listener = (function () {
                    var cameraToDeactivate = cameraEl;
                    return function() {
                      cameraToDeactivate.setAttribute('camera', 'active', false);
                      cameraToDeactivate.pause();
                  }})();
                  cameraEl.addEventListener('nodeready', listener);
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
        var sceneIndex;
        if (this.animationFrameID) {
          cancelAnimationFrame(this.animationFrameID);
          this.animationFrameID = null;
        }
        this.argonApp.reality.changeEvent.removeEventListener(this.argonChangeReality);
        this.argonApp.reality.connectEvent.removeEventListener(this.argonSessionChange);
        this.removeEventListeners();

        // Remove from scene index.
        sceneIndex = scenes.indexOf(this);
        scenes.splice(sceneIndex, 1);
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
            var time = frame.timestamp;
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

		enterVR: {
			value: function (event) {
				var self = this;

				// Don't enter VR if already in VR.
				if (this.is('vr-mode')) { return Promise.resolve('Already in VR.'); }

        // why would this get called before init?  Dunno, but there was an instance
        if (this.argonApp) {
  				return this.argonApp.device.requestEnterHMD(enterVRSuccess, enterVRFailure);
        }
				function enterVRSuccess () {
					self.addState('vr-mode');
					self.emit('enter-vr', event);
				}

				function enterVRFailure (err) {
					if (err && err.message) {
						throw new Error('Failed to enter VR mode (`argonApp.device.requestEnterHMD`): ' + err.message);
					} else {
						throw new Error('Failed to enter VR mode (`argonApp.device.requestEnterHMD`).');
					}
				}
			}
		},

		exitVR: {
			value: function () {
				var self = this;

				// Don't exit VR if not in VR.
				if (!this.is('vr-mode')) { return Promise.resolve('Not in VR.'); }

        // why would this get called before init?  Dunno, but there was an instance
        if (this.argonApp) {
  				return this.argonApp.device.requestEnterHMD(exitVRSuccess, exitVRFailure);
        }
				function exitVRSuccess () {
					self.removeState('vr-mode');
					self.emit('exit-vr', {target: self});
				}

				function exitVRFailure (err) {
					if (err && err.message) {
						throw new Error('Failed to exit VR mode (`exitPresent`): ' + err.message);
					} else {
						throw new Error('Failed to exit VR mode (`exitPresent`).');
					}
				}
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

        var camera = this.camera;
        var renderer = this.renderer;
        if (!renderer || !camera) {
          // renderer hasn't been setup yet
          this.animationFrameID = null;
          return;
        }

        var app = this.argonApp;
        var scene = this.object3D;
        var cssRenderer = this.cssRenderer;
        var hud = this.hud;
        
        // the camera object is created from a camera property on an entity. This should be
        // an ar-camera, which will have the entity position and orientation set to the pose
        // of the user.  We want to make the camera pose 
        //var camEntityPos = null;
        //var camEntityRot = null;
        //var camEntityInv = new THREE.Matrix4();

        if (camera.parent) {
            camera.parent.updateMatrixWorld();
            camEntityInv.getInverse(camera.parent.matrixWorld);
            //     camEntityPos = camera.parent.position.clone().negate();
            //     camEntityRot = camera.parent.quaternion.clone().inverse();
        }

        const view = app.view;
        renderer.setSize(view.renderWidth, view.renderHeight, false);    

        var viewport = view.viewport;
        if (this.cssRenderer) {
          cssRenderer.setSize(viewport.width, viewport.height);
        }
        if (this.hud) {
          hud.setSize(viewport.width, viewport.height);
        }

        // leverage vr-mode.  Question: perhaps we shouldn't, perhaps we should use ar-mode?
        // unclear right now how much of the components that use vr-mode are re-purposable
        //var _a = app.view.getSubviews();
        var _a = app.view.subviews;
        // if (this.is('vr-mode')) {
        //   if (_a.length == 1 && this.is('vr-mode')) {
        //     this.removeState('vr-mode');
        //     this.emit('exit-vr', {target: this});
        //   } 
        // } else {
        //   if (_a.length > 1 && !this.is('vr-mode')) {
        //     this.addState('vr-mode');
        //     this.emit('enter-vr', {target: this});
        //   }
        // }
        if (this.is('vr-mode')) {
          if (_a.length == 1) {
            console.log("calling presentChange from render, because vr-mode is set and view is mono");
            this.argonPresentChange();
          } 
        } else {
          if (_a.length > 1) {
            console.log("calling presentChange from render, because vr-mode not set and view is stereo");
            this.argonPresentChange();
          }
        }

        // set the camera properties to the values of the 1st subview.
        // While this is arbitrary, it's likely many of these will be the same
        // across all subviews, and it's better than leaving them at the 
        // defaults, which are almost certainly incorrect
        camera.near = _a[0].frustum.near;
        camera.far = _a[0].frustum.far;
        camera.aspect = _a[0].frustum.aspect;
        
        // if the viewport width and the renderwidth are different
        // we assume we are rendering on a different surface than
        // the main display, so we reset the pixel ratio to 1
        if (viewport.width != view.renderWidth) {
            renderer.setPixelRatio(1);
        } else {
            renderer.setPixelRatio(window.devicePixelRatio);
        }

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

            if (this.hud) {
              // adjust the hud
              hud.setViewport(x, y, width, height, subview.index);
              hud.render(subview.index);
            }

            // set the webGL rendering parameters and render this view
            // set the viewport for this view
            var _c = subview.renderViewport, x = _c.x, y = _c.y, width = _c.width, height = _c.height;
            renderer.setViewport(x, y, width, height);
            renderer.setScissor(x, y, width, height);
            renderer.setScissorTest(true);
            renderer.render(scene, camera);
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
