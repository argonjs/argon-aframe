var AEntity = AFRAME.AEntity;
var ANode = AFRAME.ANode;

AFRAME.registerSystem('vuforia', {
    init: function () {
        this.api = null;
        this.currentDatasetURL = '';
        this.datasetsMap = {};
        this.available = false;
        this.initPromise = null;
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

    startVuforia: function(key) {
        if (this.api) { return; }
        if (this.initPromise) { return; }

        var self = this;
        var sceneEl = this.sceneEl;

        this.initPromise = new Promise(function waitForArgon (resolve) {
            if (sceneEl.argonApp) { return resolve(); }
            sceneEl.addEventListener('argon-initialized', resolve);
        }).then(function() {
            var argonApp = sceneEl.argonApp;

            argonApp.vuforia.isAvailable().then(function(available) {
                if (self.available) {
                    // this code has already run successfully!
                    return;
                }

                if (!available) {
                    self.available = false;
                    throw new Error('vuforia not available on this platform.');
                } 
                self.available = true;

                // we know it's available to try to initialize
                if (key) {
                    xhrLoader.load(key, function (textResponse) {
                        argonApp.vuforia.init({
                            licenseKey: textResponse
                        }).then(function(api) {
                            self.api = api;
                            sceneEl.emit('argon-vuforia-initialized', {
                                target: self
                            });                            
                        })
                    });
                }                
            });
        });
    },

    createDataset: function (name, url, fetched) {
        var api = this.api;
        if (!api) {
            throw new Error('vuforia.createDataset: API not initialized');
        }

        // should have both vuforia and argon initialized by now
        var dataset = this.datasetMap[name];
        if (dataset) {
            if (dataset.url !== url) {
                throw new Error('ar-vuforia-dataset "' + name + '"must be attached to an <ar-scene>.');
            }
            if (dataset.dataset) {
                throw new Error('vuforia.createDataset called multiple times for name=' + name + ', url=' + url);
            }
        } 
        api.objectTracker.createDataSet(url).then(function (dataSet) {
            self.datasetMap[name] = {
                dataset: dataSet, 
                url: url, 
                loaded: false, 
                active: false, 
                targets:  dataset ? dataset.targets || {} : {},
                trackables: null
            };
            dataSet.fetch().then(function () {
                fetched();
            });
        });
    },

    setDatasetActive: function (name, active) {
        var api = this.api;
        if (!api) {
            throw new Error('vuforia.setDatsetActive: API not initialized');
        }
        
        var dataset = this.datasetMap[name];
        if (!dataset) {
            throw new Error('ar-vuforia-dataset "' + name + '"must be created before being activated.');            
        }
        if (!dataset.loaded) {
            dataSet.load().then(function () {
                dataset.loaded = true;
                if (active) {
                    dataset.active = true;
                    api.objectTracker.activateDataSet(dataset.dataSet);
                }
                Object.keys(dataset.targets).forEach(function(key,index) {
                    self.subscribeToTarget(name, key, index);
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

    subscribeToTarget: function (name, target, count) {
        var api = this.api;
        var dataset = this.datasetMap[name];

        if (arguments.length < 3) { 
            count = 1;
        }
        if (!api || !dataset)  {
            this.datasetMap[name] = {
                targets: {}
            };            
            this.datasetMap[name].targets[target] = count;
        } else if(!this.datasetMap[name].targets[target]) {
            dataset.targets[target] = count;
            if (dataset.loaded) {
                var trackables = dataset.dataSet.getTrackables();
                var tracker = trackables[target];
                if (tracker && tracker.id) {
                    this.sceneEl.argonApp.context.subscribeToEntityById(tracker.id);
                }
            }
        } else {
            this.datasetMap[name].targets[target] += count;
        }
    },
});

    /// How many image targets to detect and track at the same time:
    ///     MaxSimultaneousImageTargets

    /**
     *  This hint tells the tracker how many image shall be processed
     *  at most at the same time. E.g. if an app will never require
     *  tracking more than two targets, this value should be set to 2.
     *  Default is: 1.
     */
    
    /// How many object targets to detect and track at the same time
    ///     MaxSimultaneousObjectTargets
    /**
     *  This hint tells the tracker how many 3D objects shall be processed
     *  at most at the same time. E.g. if an app will never require
     *  tracking more than 1 target, this value should be set to 1.
     *  Default is: 1.
     */
    
    /// Force delayed loading for object target Dataset
    ///     DelayedLoadingObjectDatasets
    /**
     *  This hint tells the tracker to enable/disable delayed loading
     *  of object target datasets upon first detection.
     *  Loading time of large object dataset will be reduced
     *  but the initial detection time of targets will increase.
     *  Please note that the hint should be set before loading
     *  any object target dataset to be effective.
     *  To enable delayed loading set the hint value to 1.
     *  To disable delayed loading set the hint value to 0.
     *  Default is: 0.
     */


AFRAME.registerComponent('vuforia', {
    schema: { 
        key: {type: 'src'}
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
        
        if (!el.isScene) {
            warn('Fog component can only be applied to <a-scene>');
            return;
        }
        if (!system.api) {
            // vuforia hasn't been initialized, so let's start by doing that
            system.startVuforia(data.key);    
        }
    }
});

AFRAME.registerElement('ar-vuforia-dataset', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.isAssetItem = true;
      }
    },

    init: { 
      value: function () {
        var self = this;
        var sceneEl = this.sceneEl;

        if (!sceneEl.isArgon) {
            throw new Error('ar-vuforia-dataset must be used in an <ar-scene>.');
        }

        var src = this.getAttribute('src');
        var active = this.getComputedAttribute('active');
        var id = this.getAttribute('id');

        var vuforia = sceneEl.systems["vuforia"];

        vuforia.whenInitialized(function() {
            vuforia.createDataset(id, src, function() {
                vuforia.whenInitialized(function () {
                    vuforia.setDatasetActive(id, active);
                    ANode.prototype.load.call(self);
                })
            });
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
                vuforia.whenInitialized(function () {
                    vuforia.setDatasetActive(id, newVal);
                })
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
