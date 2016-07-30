var AEntity = AFRAME.AEntity;
var ANode = AFRAME.ANode;

AFRAME.registerSystem('vuforia', {
    init: function () {
        this.key = "";
        this.api = null;
        this.datasetsMap = {};
        this.available = false;

        this.sceneEl.addEventListener('argon-initialized', this.startVuforia.bind(this));
    },

    whenInitialized: function (resolve) {
        var self = this;
        return new Promise(function (resolve) {
            if (self.api) { resolve(); } 
            else {
                self.sceneEl.addEventListener('argon-vuforia-initialized', resolve);
            }
        });
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

        if (this.api) { return; }
        if (!argonApp) { return; }
        if (this.key === "") { return; }


        argonApp.vuforia.isAvailable().then(function(available) {
            if (self.available) {
                // this code has already run successfully!
                return;
            }

            if (!available) {
                self.available = false;
                console.warn('vuforia not available on this platform.');
                sceneEl.emit('argon-vuforia-not-available', {
                    target: sceneEl
                });                            
                return;
            } 
            self.available = true;

            argonApp.vuforia.init({
                    licenseKey: this.key
            }).then(function(api) {
                self.api = api;
                sceneEl.emit('argon-vuforia-initialized', {
                    target: sceneEl
                });                            
            });
        });
    },
 
    createEmptyDataset: function () {
        return {
            dataset: null, 
            url: null, 
            fetched: false,
            loaded: false, 
            active: false, 
            targets: {},
            trackables: null
        };
    },

    createDataset: function (name, url, active, fetched) {
        var api = this.api;

        var dataset = this.datasetMap[name];

        // if dataset exists, and doesn't have a URL, it's because targets were registered before the 
        // dataset was set up, which is fine.  Otherwise, duplicate!
        if (dataset && dataset.url != null) {
            console.warn('vuforia.createDataset called multiple times for name=' + name + ', ignoring extra datasets');
            return;            
        } 

        // set up the mapping if not there
        if (!dataset) {
            dataset = this.datasetMap[name] = this.createEmptyDataset();
        }

        // add the url and active setting to the existing one
        dataset.url = url;
        dataset.active = active;

        // if it's not yet initialized, return.  
        if (!api) {
            return;
        }

        // should have both vuforia and argon initialized by now
        api.objectTracker.createDataSet(url).then(function (data) {
            dataset.dataset = data; 
            dataSet.fetch().then(function () {
                dataset.fetched = true;
                self.setDatasetActive(name, dataset.active);
                fetched();
            });
        });
    },

    setDatasetActive: function (name, active) {
        var api = this.api;
        var dataset = this.datasetMap[name];

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

        if (!dataset.loaded) {
            dataSet.load().then(function () {
                dataset.loaded = true;
                dataset.fetched = true;
                dataset.trackables = dataset.dataSet.getTrackables();
                if (active) {
                    dataset.active = true;
                    api.objectTracker.activateDataSet(dataset.dataSet);
                }

                // re-call subscribeToTarget to subscribe the targets already requested
                Object.keys(dataset.targets).forEach(function(key,index) {
                    self.subscribeToTarget(name, key, true);
                });
            });
        } else {
            if (dataset.active != active) {
                dataset.active = active;
                if (active) {
                    api.objectTracker.activateDataSet(dataset.dataSet);
                } else {
                    api.objectTracker.activateDataSet(dataset.dataSet);                
                }
            }
        }        
    },

    subscribeToTarget: function (name, target, postLoad) {
        var api = this.api;
        var dataset = this.datasetMap[name];

        // set up the mapping if not there
        if (!dataset) {
            dataset = this.datasetMap[name] = this.createEmptyDataset();
        }
        
        // either create a new target entry and set the count, or add the count to an existing one
        target = dataset.targets[target];
        if (!target) {
            dataset.targets[target] = 1;
        } else if (!postLoad) {
            dataset.targets[target] += 1;
        }

        if (!api) { return; }

        if (dataset.loaded) {
            var tracker = trackables[target];
            if (tracker && tracker.id) {
                this.sceneEl.argonApp.context.subscribeToEntityById(tracker.id);
            }
        }
    },
});

// the parameter to vuforia is a reference to a element.
// If the element is an a-asset-item, the key should have been downloaded into its data property
// Otherwise, assume the key is in the innerHTML (contents) of the element
AFRAME.registerComponent('vuforia', {
    schema: { 
        type: 'string'
    },

    /**
     * Nothing to do
     */
    init: function () {
    },

    /** 
     * Update:  first time in, we initialize vuforia
     */
    update: function (oldData) {
        var el = this.el;
        var data = this.data;
        var system = this.system;

        if (!el.isArgon) {
            console.warn('vuforia component can only be applied to <ar-scene>');
            return;
        }

        var keyAsset = el.querySelector(this.data);
        if (keyAsset) {
            if (keyAsset.isAsset) {
                system.setKey(keyAsset.data);
            } else {
                system.setKey(keyAsset.innerHTML);
            }
        }
    }
});

AFRAME.registerElement('ar-vuforia-dataset', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.active = false;
        this.url = "";
        this.datasetLoaded = false;
      }
    },

    attachedCallback: {
      value: function () {
        this.init();
        this.load();
      },
      writable: window.debug
    },

    detachedCallback: {
      value: function () {
        // deactive dataset if active
        // remove dataset from system
      }
    },

    init: { 
      value: function () {
        var self = this;
        var sceneEl = this.sceneEl;

        if (!sceneEl.isArgon) {
            console.warn('ar-vuforia-dataset must be used in an <ar-scene>.');
            return;
        }

        var id = this.getAttribute('id');
        var src = this.getAttribute('src');
        var active = this.getComputedAttribute('active');

        var vuforia = sceneEl.systems.vuforia;
        vuforia.createDataset(id, src, active, function() {
            self.datasetLoaded = true;
        });        
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        var self = this;
        var sceneEl = this.sceneEl;
        var vuforia = sceneEl.systems["vuforia"];
        var id = this.getAttribute('id');

        if (attr === "active") {
            vuforia.setDatasetActive(id, newVal);
        }
        if (attr === "src" || attr === "id") {
            console.warn("cannot change the id or src of an ar-vuforia-dataset")
        }
      }
    }    
  })
});

// AFRAME.registerElement('ar-vuforia-key', {
//   prototype: Object.create(ANode.prototype, {
//     createdCallback: {
//       value: function () {
//         this.data = null;
//         this.isAssetItem = true;
//       }
//     },

//     attachedCallback: {
//       value: function () {
//         var self = this;
        
//         var src = this.getAttribute('src');
//         if (src) {
//             xhrLoader.load(src, function (textResponse) {
//                 self.data = textResponse;
//                 ANode.prototype.load.call(self);
//             });
//         }
//       }
//     }
//   })
// });
