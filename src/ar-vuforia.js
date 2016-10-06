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

                // tell everyone the good news.  Include the trackables.
                self.sceneEl.emit('argon-vuforia-dataset-loaded', {
                    target: dataset.component,
                    trackables: dataset.trackables
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
        var targetItem = dataset.targets[target];
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

        console.log("getTargetEntity " + name + "." + target)

        // set up the mapping if not there
        if (!api || !dataset || !dataset.loaded) {
            return null;
        }

        // check if we've subscribed. If we haven't, bail out, because we need to        
        var targetItem = dataset.targets[target];
        if (!targetItem) {
            return null;
        }

        var tracker = dataset.trackables[target];
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
