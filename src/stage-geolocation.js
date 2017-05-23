AFRAME.registerComponent('stagelocation', {
    schema: {
        type: 'vec3'
    },

    init: function () {
        var el = this.el;

        this.geoRealitySession = undefined;

        if (!el.isArgon) {
            console.warn('stagelocation should be attached to an <ar-scene>.');
        } else {
            el.argonApp.reality.connectEvent.addEventListener(this.realityWatcher.bind(this));
        }
    },

    update: function (oldData) {
        this.geolocation = {
            geolocation: Argon.Cesium.Cartographics.fromDegrees(data.x,
            latitude: this.data.lla.y,
            height: this.data.lla.z,
            offsetDegrees: this.data.offsetdegrees
        };
        this.showOptions = {
            url: Argon.resolveURL(this.data.src),
            transition: {
                easing: this.data.easing,
                duration: this.data.duration
            }            
        }
    },

    realityWatcher: function(session) {
        // check if the connected supports our panorama protocol
        if (session.supportsProtocol('edu.gatech.ael.panorama')) {
            // save a reference to this session so our buttons can send messages
            this.panoRealitySession = session

            // load our panorama
            this.panoRealitySession.request('edu.gatech.ael.panorama.loadPanorama', this.panorama);
  
            if (this.data.initial) {
                // show yourself!
                this.el.emit("showpanorama", {name: this.name});
            }

            var self = this;
            session.closeEvent.addEventListener(function(){
                self.panoRealitySession = undefined;
            })
        }
    },

    showPanorama: function(evt) {
        if (evt.detail.name === this.name) { 
            this.active = true;
            var self = this;

            if (this.panoRealitySession) {
                this.panoRealitySession.request('edu.gatech.ael.panorama.showPanorama', this.showOptions).then(function(){
                    console.log("showing panorama: " + self.name);

                    self.el.emit('showpanorama-success', {
                        name: self.name
                    });     
                }).catch(function(err) {
                    console.log("couldn't show panorama: " + err.message);

                    self.el.emit('showpanorama-failed', {
                        name: self.name,
                        error: err
                    });     
                });                     
            }   
        } else {
            this.active = false;
        }
    }
});
