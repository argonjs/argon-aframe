AFRAME.registerSystem('jsartoolkit', {
    init: function () {
        this.webrtcRealitySession = undefined;
        this.markerMap = {};
        this.initInProgress = false;
        this.disableStartup = false;

        this.sceneEl.addEventListener('argon-initialized', this.startJSARToolKit.bind(this));
    },

    startJSARToolKit: function() {
        var sceneEl = this.sceneEl;
        var argonApp = sceneEl.argonApp;

        // need argon
        if (!argonApp) { return; }

        // if startup disabled (e.g. because vuforia has priority) return
        if (this.disableStartup) { return; }

        // if no markers, this app may not need jsartoolkit
        if (Object.keys(this.markerMap).length == 0) { return; }

        // if already initialized, bye bye
        if (this.webrtcRealitySession) { return; }

        // initialization is already in progress
        if (this.initInProgress) { return; }

        // set our desired reality
        this.initInProgress = true;
        argonApp.reality.connectEvent.addEventListener(this.realityWatcher.bind(this));
        argonApp.reality.request(Argon.RealityViewer.WEBRTC);
    },

    realityWatcher: function(session) {
        var self = this;
        var sceneEl = this.sceneEl;

        // check if the connected supports our jsartoolkit protocol
        if (session.supportsProtocol('ar.jsartoolkit')) {
            // save a reference to this session
            this.webrtcRealitySession = session;

            this.webrtcRealitySession.request('ar.jsartoolkit.init').then(function(){
                console.log("jsartoolkit initialized!")
                this.initInProgress = false;

                // re-call createOrUpdateMarker to create markers already requested
                Object.keys(self.markerMap).forEach(function(key,index) {
                    var marker = self.markerMap[key];
                    console.log("re-initializing marker " + key);
                    self.createOrUpdateMarker(marker.component, key, marker.url)
                });

                // tell everyone the good news
                sceneEl.emit('argon-jsartoolkit-initialized', {
                    target: sceneEl
                });                            
            }).catch(function(err) {
                console.log("jsartoolkit failed to initialize: " + err.message);

                sceneEl.emit('argon-jsartoolkit-initialization-failed', {
                    target: sceneEl,
                    error: err
                });
            });

            var self = this;
            session.closeEvent.addEventListener(function(){
                self.webrtcRealitySession = undefined;
            })
        }
    },

    // create an empty marker
    createEmptyMarkerObject: function () {
        return {
            component: null,
            url: null,
            id: null,
            loaded: false,
            initInProgress: false
        }
    },

    // create a new marker or update one currently created.  
    createOrUpdateMarker: function (component, name, url) {
        var self = this;
        var marker = this.markerMap[name];

        // if marker exists, and matches the previous element, it's because marker was registered before the 
        // reality was set up, which is fine.  Otherwise, its a duplicate marker name, which isn't allowed!
        if (marker) {
          if (marker.component) {
            if (marker.component != component) {
                console.warn('jsartoolkit.createOrUpdateMarker called multiple times for id=' + name + ', ignoring extra markers');
                return;
            }   
            if (marker.url != url) {
                console.warn("can't change the url for a jsartoolkit marker once it's created.  Ignoring new URL '" + url + "' for marker '" + name + "'")
                return;
            }
          } else {
            // first time this has been called, the marker is there already
            marker.component = component;
            marker.url = url;
          }
        } else {
            // set up the mapping if not there
            marker = this.markerMap[name] = this.createEmptyMarkerObject();
            marker.component = component;
            marker.url = url;
        }

        if (this.webrtcRealitySession && !marker.initInProgress) {
            // should have both jsartoolkit and argon initialized by now
            marker.initInProgress = true;
            this.webrtcRealitySession.request('ar.jsartoolkit.addMarker', {
                url: marker.url
            }).then(function(msg){
                if (!msg) return;
                console.log("created marker " + name );
                marker.initInProgress = false;
                marker.id = msg.id;
                marker.loaded = true;

                this.sceneEl.argonApp.context.subscribeToEntityById(marker.id);

                self.sceneEl.emit('argon-jsartoolkit-marker-loaded', {
                    target: marker.component
                });  
            })
        }
    },

    subscribeToMarker: function (name) {
        var marker = this.markerMap[name];

        // set up the mapping if not there
        if (!marker) {
            marker = this.markerMap[name] = this.createEmptyMarkerObject();
        }
        
        console.log("subscribe to " + name)

        if (!this.webrtcRealitySession) { return null; }
            
        if (marker.loaded) {
            return this.sceneEl.argonApp.context.subscribeToEntityById(marker.id);
        }
        // not loaded yet
        return null;
    },

    getMarkerEntity: function (name) {
        var marker = this.markerMap[name];

        console.log("getMarkerEntity " + name);

        if (marker && marker.id) {
            console.log("retrieved " + name)
            return this.sceneEl.argonApp.context.entities.getById(marker.id);
        } else {
            console.warn("can't get marker '" + name);
        }
        return null;
    }
});

AFRAME.registerComponent('jsartoolkitmarker', {
    multiple: true,

    schema: {
        src: {type: 'src'}
    },

    init: function () {
        var el = this.el;

        this.name = "default_marker";
        this.markerLoaded = false;

        if (!el.isArgon) {
            console.warn('jsartoolkitmarker should be attached to an <ar-scene>.');
        }
    },

    update: function (oldData) {
        var sceneEl = this.el.sceneEl;
        this.name = this.id ? this.id : "default_marker";

        var jsartoolkit = sceneEl.systems["jsartoolkit"];
        jsartoolkit.createOrUpdateMarker(this, this.name, this.data.src);

        // start just in case we haven't started yet
        jsartoolkit.startJSARToolKit();
    }
});
