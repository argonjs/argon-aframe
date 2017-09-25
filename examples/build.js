(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../src/ar-scene.js');
require('../src/ar-components.js');
require('../src/ar-referenceframe.js');
require('../src/css-object.js');
require('../src/ar-vuforia.js');
require('../src/ar-jsartoolkit.js');
require('../src/panorama-reality.js');
},{"../src/ar-components.js":6,"../src/ar-jsartoolkit.js":7,"../src/ar-referenceframe.js":8,"../src/ar-scene.js":9,"../src/ar-vuforia.js":10,"../src/css-object.js":11,"../src/panorama-reality.js":12}],2:[function(require,module,exports){
/**
 * Animation configuration options for TWEEN.js animations.
 * Used by `<a-animation>`.
 */
var TWEEN = require('tween.js');

var DIRECTIONS = {
  alternate: 'alternate',
  alternateReverse: 'alternate-reverse',
  normal: 'normal',
  reverse: 'reverse'
};

var EASING_FUNCTIONS = {
  'linear': TWEEN.Easing.Linear.None,

  'ease': TWEEN.Easing.Cubic.InOut,
  'ease-in': TWEEN.Easing.Cubic.In,
  'ease-out': TWEEN.Easing.Cubic.Out,
  'ease-in-out': TWEEN.Easing.Cubic.InOut,

  'ease-cubic': TWEEN.Easing.Cubic.In,
  'ease-in-cubic': TWEEN.Easing.Cubic.In,
  'ease-out-cubic': TWEEN.Easing.Cubic.Out,
  'ease-in-out-cubic': TWEEN.Easing.Cubic.InOut,

  'ease-quad': TWEEN.Easing.Quadratic.InOut,
  'ease-in-quad': TWEEN.Easing.Quadratic.In,
  'ease-out-quad': TWEEN.Easing.Quadratic.Out,
  'ease-in-out-quad': TWEEN.Easing.Quadratic.InOut,

  'ease-quart': TWEEN.Easing.Quartic.InOut,
  'ease-in-quart': TWEEN.Easing.Quartic.In,
  'ease-out-quart': TWEEN.Easing.Quartic.Out,
  'ease-in-out-quart': TWEEN.Easing.Quartic.InOut,

  'ease-quint': TWEEN.Easing.Quintic.InOut,
  'ease-in-quint': TWEEN.Easing.Quintic.In,
  'ease-out-quint': TWEEN.Easing.Quintic.Out,
  'ease-in-out-quint': TWEEN.Easing.Quintic.InOut,

  'ease-sine': TWEEN.Easing.Sinusoidal.InOut,
  'ease-in-sine': TWEEN.Easing.Sinusoidal.In,
  'ease-out-sine': TWEEN.Easing.Sinusoidal.Out,
  'ease-in-out-sine': TWEEN.Easing.Sinusoidal.InOut,

  'ease-expo': TWEEN.Easing.Exponential.InOut,
  'ease-in-expo': TWEEN.Easing.Exponential.In,
  'ease-out-expo': TWEEN.Easing.Exponential.Out,
  'ease-in-out-expo': TWEEN.Easing.Exponential.InOut,

  'ease-circ': TWEEN.Easing.Circular.InOut,
  'ease-in-circ': TWEEN.Easing.Circular.In,
  'ease-out-circ': TWEEN.Easing.Circular.Out,
  'ease-in-out-circ': TWEEN.Easing.Circular.InOut,

  'ease-elastic': TWEEN.Easing.Elastic.InOut,
  'ease-in-elastic': TWEEN.Easing.Elastic.In,
  'ease-out-elastic': TWEEN.Easing.Elastic.Out,
  'ease-in-out-elastic': TWEEN.Easing.Elastic.InOut,

  'ease-back': TWEEN.Easing.Back.InOut,
  'ease-in-back': TWEEN.Easing.Back.In,
  'ease-out-back': TWEEN.Easing.Back.Out,
  'ease-in-out-back': TWEEN.Easing.Back.InOut,

  'ease-bounce': TWEEN.Easing.Bounce.InOut,
  'ease-in-bounce': TWEEN.Easing.Bounce.In,
  'ease-out-bounce': TWEEN.Easing.Bounce.Out,
  'ease-in-out-bounce': TWEEN.Easing.Bounce.InOut
};

var FILLS = {
  backwards: 'backwards',
  both: 'both',
  forwards: 'forwards',
  none: 'none'
};

var REPEATS = {
  indefinite: 'indefinite'
};

var DEFAULTS = {
  attribute: 'rotation',
  begin: '',
  end: '',
  delay: 0,
  dur: 1000,
  easing: 'ease',
  direction: DIRECTIONS.normal,
  fill: FILLS.forwards,
  from: undefined,
  repeat: 0,
  to: undefined
};

module.exports.defaults = DEFAULTS;
module.exports.directions = DIRECTIONS;
module.exports.easingFunctions = EASING_FUNCTIONS;
module.exports.fills = FILLS;
module.exports.repeats = REPEATS;

},{"tween.js":5}],3:[function(require,module,exports){
module.exports = {
  AFRAME_INJECTED: 'aframe-injected',
  DEFAULT_CAMERA_HEIGHT: 1.6,
  animation: require('./animation'),
  keyboardevent: require('./keyboardevent')
};

},{"./animation":2,"./keyboardevent":4}],4:[function(require,module,exports){
module.exports = {
  // Tiny KeyboardEvent.code polyfill.
  KEYCODE_TO_CODE: {
    '38': 'ArrowUp',
    '37': 'ArrowLeft',
    '40': 'ArrowDown',
    '39': 'ArrowRight',
    '87': 'KeyW',
    '65': 'KeyA',
    '83': 'KeyS',
    '68': 'KeyD'
  }
};

},{}],5:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// performance.now polyfill
( function ( root ) {

	if ( 'performance' in root === false ) {
		root.performance = {};
	}

	// IE 8
	Date.now = ( Date.now || function () {
		return new Date().getTime();
	} );

	if ( 'now' in root.performance === false ) {
		var offset = root.performance.timing && root.performance.timing.navigationStart ? performance.timing.navigationStart
		                                                                                : Date.now();

		root.performance.now = function () {
			return Date.now() - offset;
		};
	}

} )( this );

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : window.performance.now();

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
( function ( root ) {

	if ( typeof define === 'function' && define.amd ) {

		// AMD
		define( [], function () {
			return TWEEN;
		} );

	} else if ( typeof exports === 'object' ) {

		// Node.js
		module.exports = TWEEN;

	} else {

		// Global variable
		root.TWEEN = TWEEN;

	}

} )( this );

},{}],6:[function(require,module,exports){
var zeroScale = 0.00001;

AFRAME.registerComponent('fixedsize', {
  schema: { 
    default: 1
  },

  init: function () {
      this.scale = 1;
      this.factor = 1;
  },

  update: function () {
    var data = this.data;
    this.scale = data === 0 ? zeroScale : data;
  },

  tick: function (t) {
    var object3D = this.el.object3D;
    var camera = this.el.sceneEl.camera;
    if (!camera) {return;}

    var cameraPos = camera.getWorldPosition();
    var thisPos = object3D.getWorldPosition();
    var distance = thisPos.distanceTo(cameraPos);

    // base the factor on the viewport height.   
    // I think we need to use the renderviewport size, since we really care about what is rendered.
    // This means that when we're rendering on an HMD, and are using this to scale HTML content, the content might be 
    // the wrong size
    var height = this.el.sceneEl.argonApp.view.renderHeight;
    this.factor = 2 * (this.scale / height); 

    // let's get the fov scale factor from the camera
    fovScale = Math.tan(THREE.Math.degToRad(camera.fov) / 2) * 2;

    // if distance < near clipping plane, just use scale at the near plane.  Don't go any bigger
    var factor = fovScale * (distance < camera.near ? camera.near * this.factor : distance * this.factor);
    object3D.scale.set(factor, factor, factor);
  }
});

AFRAME.registerComponent('trackvisibility', {
  schema: { 
    default: true
  },

  init: function () {
    var self = this;
    this.el.addEventListener('referenceframe-statuschanged', function(evt) {
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
  }
}); 

AFRAME.registerComponent('physical', {
  schema: { 
    default: true
  },

  init: function () {
  },

  // "mesh" could change and we won't be notified.  Bummer
  update: function (oldData) {
      var mesh = this.el.getOrCreateObject3D("mesh");
      if (mesh) {
      	mesh.material.colorWrite = !this.data; // only update the depth
	      mesh.renderOrder = this.data ? -2 : 0;   // before everything else
      }  
  }
}); 

AFRAME.registerComponent('show-in', {
  schema: { 
    ar: {default: false},
    vr: {default: false},
    "arhmd": { default: false},
    "vrhmd": { default: false} 
  },

  init: function () {
    var self = this;
    this.el.sceneEl.addEventListener('enter-vr', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('exit-vr', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('enter-ar', function (evt) { self.updateVisibility(evt); });
    this.el.sceneEl.addEventListener('exit-ar', function (evt) { self.updateVisibility(evt); });
    self.updateVisibility();
  },

  updateVisibility: function () {
    var sceneEl = this.el.sceneEl;

    var armode = sceneEl.is('ar-mode');
    var hmdmode = sceneEl.is('vr-mode');

    var data = this.data;
    var visible = false;

    if (data.arhmd && armode && hmdmode) { visible = true;}
    if (data.vrhmd && !armode && hmdmode) { visible = true;}
    if (data.ar && armode) { visible = true;}
    if (data.vr && !armode) { visible = true;}
  
    this.el.object3D.visible = visible;
  },

  update: function () {
  }
}); 

AFRAME.registerComponent('desiredreality', {
    schema: {
        src: {type: 'src'},
        name: {default: "Custom Reality"}
    },
    
    init: function () {
        var el = this.el;

        if (!el.isArgon) {
            console.warn('vuforiadataset should be attached to an <ar-scene>.');
        }
    },

    remove: function () {
        var el = this.el;
        if (el.isArgon) {
          el.argonApp.reality.setDesired(undefined);
        }
    },

    update: function () {
        var el = this.el;
        var data = this.data;

        if (el.isArgon) {
          el.argonApp.reality.setDesired({
            title: data.name,
            uri: Argon.resolveURL(data.src)
          });
        }
    }
});

AFRAME.registerComponent('enablehighaccuracy', {
    schema: {
      default: true
    },
    
    init: function () {
        var el = this.el;

        if (!el.isArgon) {
            console.warn('enablehighaccuracy should be attached to an <ar-scene>.');
        }
    },

    update: function () {
        var el = this.el;
        var data = this.data;

        // do nothing if it's not an argon scene entity
        if (el.isArgon) {
          // remember our current desired accuracy
          el.enableHighAccuracy = data;

          // re-request geolocation, so it uses the new accuracy
          el.subscribeGeolocation();
        }
    }
});


/*
 * create some lights based on the sun and moon
 */
AFRAME.registerComponent('sunmoon', {
    schema: {
        default: true
    },
    
    init: function () {
        var el = this.el;

        if (!el.isArgon) {
            console.warn('sunmoon should be attached to an <ar-scene>.');
        }
        // requires that you've included 
        if (THREE.SunMoonLights) {
            // this needs geoposed content, so subscribe to geolocation updates
            if (el.isArgon) {
              this.el.subscribeGeolocation();
            }        
            this.sunMoonLights = new THREE.SunMoonLights();
            window.CESIUM_BASE_URL='https://samples-develop.argonjs.io/resources/cesium/';
        }
    },

    remove: function () {
        var el = this.el;
        if (el.isArgon && this.sunMoonLights) {
            this.sunMoonLights = null;
            this.el.removeObject3D('sunmoon');
        }
    },

    update: function () {
        var el = this.el;
        var data = this.data;

        if (el.isArgon) {
          if (data) {
            this.el.setObject3D('sunmoon', this.sunMoonLights.lights);
          } else {
            this.el.removeObject3D('sunmoon');
          }
        }
    },

    tick: function () {
      if (this.data && this.sunMoonLights) {
        var context = this.el.argonApp.context;
      	this.sunMoonLights.update(context.time,context.defaultReferenceFrame);
      }
    }
});

/**
 * based on https://github.com/Utopiah/aframe-triggerbox-component
 * 
 * Usage <a-entity radius=10 trigger="event: mytrigger" /> will make a 10 unit 
 * trigger region around the entity that emits the event mytrigger_entered once 
 * the camera moves in and event mytrigger_exited once the camera leaves it.
 *
 * It can also be used on other entity e.g. an enemy or a bonus.
 *
 * inspired by https://github.com/atomicguy/aframe-fence-component/
 *
 */
AFRAME.registerComponent('trigger', {
  multiple: true,
  schema: {
      radius: {default: 1},
      event: {default: 'trigger'},
      initial: {default: false}
  },
  init: function() {
      // we don't know yet where we are
      this.teststateset = false;
      this.laststateinthetrigger = false;
      this.name = "";
  },
  update: function (oldData) {
      this.radiusSquared = this.data.radius * this.data.radius;
      this.name = this.id ? this.id : "";
  },
  tick: function() {
      // gathering all the data
      var data = this.data;
      var thisradiusSquared = this.radiusSquared;
      var triggereventname = data.event;
      var laststateset = this.laststateset;
      var laststateinthetrigger = this.laststateinthetrigger;
      var camera = this.el.sceneEl.camera;

      // camera might not be set immediately
      if (!camera) { return; }

      var cameraPosition = camera.position;
      //var position = this.el.getComputedAttribute('position');
      // we don't want the attribute value, we want the "real" value
      var distanceSquared = this.el.object3D.position.distanceToSquared(cameraPosition);

      if (distanceSquared <= thisradiusSquared) {
      	// we are in
        if ((!laststateset && data.initial) || (laststateset && !laststateinthetrigger)){
          this.el.emit(triggereventname, {name: this.name, inside: true, initial: !laststateset, distanceSquared: distanceSquared});
        }
        this.laststateinthetrigger = true;
      } else {
      	// we are out
        if ((!laststateset && data.initial) || (laststateset && laststateinthetrigger)){
          // we were not before
          this.el.emit(triggereventname, {name: this.name, inside: false, initial: !laststateset, distanceSquared: distanceSquared});
        }
        this.laststateinthetrigger = false;
      }
      this.laststateset = true;
  },

});


},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
var Cesium = Argon.Cesium;
var Cartesian3 = Cesium.Cartesian3;
var Cartographic = Cesium.Cartographic;
var ConstantPositionProperty = Cesium.ConstantPositionProperty;
var ReferenceFrame = Cesium.ReferenceFrame;
var ReferenceEntity = Cesium.ReferenceEntity;
var degToRad = THREE.Math.degToRad;

// radius of earth is ~6200000, so this means "unset"
var _ALTITUDE_UNSET = -7000000;

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
        lla: { type: 'vec3', default: {x: 0, y: 0, z: _ALTITUDE_UNSET}},  
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

        this.loadingEntities = new Set();
        this.parentEntities = new Set();

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
        var sceneEl = el.sceneEl;
        var argonApp = sceneEl.argonApp;
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

        if (data.parent == "FIXED") {
            // this app uses geoposed content, so subscribe to geolocation updates
            sceneEl.subscribeGeolocation();
        }

        // parentEntity is either FIXED or another Entity or ReferenceEntity 
        var parentEntity = this.getParentEntity(data.parent);

        var cesiumPosition = null;
        if (this.attrValue.hasOwnProperty('lla'))  {
            if (data.parent !== 'FIXED') {
                console.warn("Using 'lla' with a 'parent' other than 'FIXED' is invalid. Ignoring parent value.");
                data.parent = 'FIXED';
            }
            //cesiumPosition = Cartesian3.fromDegrees(data.lla.x, data.lla.y, data.lla.z);
            if (data.lla.z === _ALTITUDE_UNSET) {

                cesiumPosition = Cartographic.fromDegrees(data.lla.x, data.lla.y);
                var self = this;

                var promise = Argon.updateHeightFromTerrain(cesiumPosition);
                
                if (!promise) {
                    console.log("failed to get height! ");
                } else {
                    promise.then(function() {
                       console.log("found height for " + data.lla.x + ", " + data.lla.y + " => " + cesiumPosition.height);
                        if (cesiumPosition.height) {
                            self.data.lla.z = cesiumPosition.height;
                        }
                        self.update(self.data);
                    }).catch(function(e) {
                        console.log(e);
                    });   
                }             
                console.log("initial height for " + data.lla.x + ", " + data.lla.y + " => " + cesiumPosition.height);                
            } else {
                console.log("had a valid altitude: " + data.lla.z)
                cesiumPosition = Cartographic.fromDegrees(data.lla.x, data.lla.y, data.lla.z);
            }

            var newEntity = argonApp.entity.createFixed(cesiumPosition, Argon.eastUpSouthToFixedFrame);
            if (el.id !== '') {
                newEntity._id = el.id;
            }

            // The first time here, we'll use the new cesium Entity.  
            // If the id has changed, we'll also use the new entity with the new id.
            // Otherwise, we just update the entity's position.
            if (this.cesiumEntity == null || (el.id !== "" && el.id !== this.cesiumEntity.id)) {
                this.cesiumEntity = newEntity;
            } else {
                this.cesiumEntity.position = newEntity.position;
                this.cesiumEntity.orientation = newEntity.orientation;
            }        

        } else {
            // The first time here, we'll create a cesium Entity.  If the id has changed,
            // we'll recreate a new entity with the new id.
            // Otherwise, we just update the entity's position.
            if (this.cesiumEntity == null || (el.id !== "" && el.id !== this.cesiumEntity.id)) {
                var options = {
                    position: new ConstantPositionProperty(Cartesian3.ZERO, parentEntity),
                    orientation: Cesium.Quaternion.IDENTITY
                }
                if (el.id !== '') {
                    options.id = el.id;
                }
                this.cesiumEntity = new Cesium.Entity(options);
            } else {
                // reset both, in case it was an LLA previously (weird, but valid)
                this.cesiumEntity.position.setValue(Cartesian3.ZERO, parentEntity);
                this.cesiumEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);
            }        
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
            parent.split("|").forEach(function (parent) {
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

                        if (parentEntity) {
                            self.parentEntities.add(parentEntity);
                        }

                        // if still not known, try again when our dataset is loaded
                        if (parentEntity === null && !self.loadingEntities.has(parent)) {
                            self.loadingEntities.add(parent);
                            console.log("not loaded, waiting for dataset for target '" + parent + "'");
                            var name = parts[1];
                            el.sceneEl.addEventListener('argon-vuforia-dataset-loaded', function(evt) {
                                console.log('dataset loaded.');
                                console.log("dataset name '" + evt.detail.target.name + "', our name '" + name + "'");
                                if (evt.detail.target.name === name) {
                                    self.loadingEntities.delete(parent);
                                    self.update(self.data);
                                }
                            });            
                            console.log("finished setting up to wait for dataset for target '" + parent + "'");
                        }
                    }
                }

                var jsartoolkit = el.sceneEl.systems["jsartoolkit"];
                if (jsartoolkit) {
                    var parts = parent.split(".");
                    if (parts.length === 2 && parts[0] === "jsartoolkit") {
                        // see if it's already a known marker entity
                        console.log("looking for marker '" + parent + "'");
                        
                        parentEntity = jsartoolkit.getMarkerEntity(parts[1]);

                        // if not known, subscribe to it
                        if (parentEntity === null) {
                            console.log("not found, subscribing to marker '" + parent + "'");
                            parentEntity = jsartoolkit.subscribeToMarker(parts[1]);
                        }

                        if (parentEntity) {
                            self.parentEntities.add(parentEntity);
                        }

                        // if still not known, try again when our marker is loaded
                        if (parentEntity === null && !self.loadingEntities.has(parent)) {
                            self.loadingEntities.add(parent);
                            console.log("not loaded, waiting for marker '" + parent + "'");
                            var name = parts[1];
                            el.sceneEl.addEventListener('argon-jsartoolkit-marker-loaded', function(evt) {
                                console.log('marker loaded.');
                                console.log("marker name '" + evt.detail.target.name + "', our name '" + name + "'");
                                if (evt.detail.target.name === name) {
                                    self.loadingEntities.delete(parent);
                                    self.update(self.data);
                                }
                            });            
                            console.log("finished setting up to wait for marker '" + parent + "'");
                        }
                    }
                }
            });

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

        var self = this;
        var data = this.data;               // parameters
        var el = this.el;                   // entity
        var object3D = el.object3D;
        var matrix = object3D.matrix;
        var argonApp = el.sceneEl.argonApp;
        var isNestedEl = !el.parentEl.isScene;

        if (!argonApp) { return };
        
        // if there is more than one possible parent entity catch the found events to set the parent
        if (this.parentEntities.size > 1) {
            this.parentEntities.forEach(function (parentEntity) {
                var entityPos = argonApp.context.getEntityPose(parentEntity);
                if (entityPos.poseStatus & Argon.PoseStatus.FOUND) {
                    console.log("found parent: " + parentEntity.id);
                    self.cesiumEntity.position.setValue(Cartesian3.ZERO, parentEntity);
                }
            });
        }

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

},{}],9:[function(require,module,exports){
var AEntity = AFRAME.AEntity;
var ANode = AFRAME.ANode;
var radToDeg = THREE.Math.radToDeg;

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
        this.hmdQuaternion = new THREE.Quaternion();
        this.hmdEuler = new THREE.Euler();
    
        // finish initializing
        this.init();
      }
    },

    init: {
      value: function () {
        this.behaviors = { tick: [], tock: [] };
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
        this.argonPostRender = this.argonPostRender.bind(this);
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

        // Handler to exit VR (e.g., Oculus Browser back button).  argon handles
        // this.onVRPresentChangeBound = bind(this.onVRPresentChange, this);
        // window.addEventListener('vrdisplaypresentchange', this.onVRPresentChangeBound);

        // Enter VR on `vrdisplayactivate` (e.g. putting on Rift headset).
        window.addEventListener('vrdisplayactivate', function () { self.enterVR(); });

        // Exit VR on `vrdisplaydeactivate` (e.g. taking off Rift headset).
        window.addEventListener('vrdisplaydeactivate', function () { self.exitVR(); });

      },
      writable: window.debug
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
        // system.init();
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

        // window.removeEventListener('vrdisplaypresentchange', this.onVRPresentChangeBound);
      }
    },

    /**
     * Add ticks and tocks.
     *
     * @param {object} behavior - Generally a component. Must implement a .update() method
     *   to be called on every tick.
     */
    addBehavior: {
      value: function (behavior) {
        var self = this;
        var behaviors = this.behaviors;
        // Check if behavior has tick and/or tock and add the behavior to the appropriate list.
        Object.keys(behaviors).forEach(function (behaviorType) {
          if (!behavior[behaviorType]) { return; }
          var behaviorArr = self.behaviors[behaviorType];
          if (behaviorArr.indexOf(behavior) === -1) {
            behaviorArr.push(behavior);
          }
        });
      }
    },

    /**
     * Set up the Argon renderer
     */
    setupRenderer: {
      value: function () {      
        var canvas = this.canvas;

        // Set at startup. To enable/disable antialias and logarithmicdepthbuffer
        // at runttime we would have to recreate the whole context
        var antialias = shouldAntiAlias(this);
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
        this.renderer.sortObjects = false;
        
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

    addEventListeners: {
        value: function () {
          this.argonApp.renderEvent.addEventListener(this.argonRender);
          this.argonApp.updateEvent.addEventListener(this.argonUpdate);
          this.argonApp.context.postRenderEvent.addEventListener(this.argonPostRender);
          
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
          this.argonApp.context.postRenderEvent.removeEventListener(this.argonPostRender);
          this.argonApp.updateEvent.removeEventListener(this.argonUpdate);
          this.argonApp.renderEvent.removeEventListener(this.argonRender);

          this.argonApp.device.presentHMDChangeEvent.removeEventListener(this.argonPresentChange);
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
          if (self.renderStarted) { return; }

          // only do this once!
          self.renderStarted = true;
       
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
          self.addEventListener('camera-set-active', fixCamera);
          fixCamera();
          
          if (self.argonApp) {
              self.addEventListeners();
          } else {
            self.addEventListener('argon-initialized', function() {
              self.addEventListeners();
            });
          }

          AEntity.prototype.play.call(self);

          if (window.performance) {
              window.performance.mark('render-started');
          }

          self.emit('renderstart');
        });

        // setTimeout to wait for all nodes to attach and run their callbacks.
        setTimeout(function () {
          AEntity.prototype.load.call(self);
        });
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
     * Wrap `updateComponent` to not initialize the component if the component has a system
     * (aframevr/aframe#2365).
     */
    updateComponent: {
      value: function (componentName) {
        if (componentName in AFRAME.systems) { return; }
        AEntity.prototype.updateComponent.apply(this, arguments);
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
     * Handle `vrdisplaypresentchange` event for exiting VR through other means than
     * `<ESC>` key. For example, GearVR back button on Oculus Browser.
     */
    //  argon handles this for us

    // onVRPresentChange: {
    //   value: function (evt) {
    //     // Entering VR.
    //     if (evt.display.isPresenting) {
    //       this.enterVR(true);
    //       return;
    //     }
    //     // Exiting VR.
    //     this.exitVR(true);
    //   }
    // },


    /**
     * Behavior-updater meant to be called from scene render.
     * Abstracted to a different function to facilitate unit testing (`scene.tick()`) without
     * needing to render.
     */
    argonUpdate: {
      value: function (frame) {
          var time = frame.timestamp;
          var timeDelta = frame.deltaTime;

          // update the camera pose with argon pose always
          var camera = this.camera;
          var user = this.argonApp.context.user;
          var pose = this.argonApp.context.getEntityPose(user);

          // Calculate HMD quaternion.
          this.hmdQuaternion = this.hmdQuaternion.copy(pose.orientation);
          this.hmdEuler.setFromQuaternion(this.hmdQuaternion, 'YXZ');
          rotation = {
            x: radToDeg(this.hmdEuler.x),
            y: radToDeg(this.hmdEuler.y),
            z: radToDeg(this.hmdEuler.z)
          };    
          camera.el.setAttribute('rotation', rotation);

          camera.el.setAttribute('position', {
            x: pose.position.x,
            y: pose.position.y,
            z: pose.position.z
          });

          if (this.isPlaying) {
              this.tick(time, timeDelta);
          }

          this.time = time;   
      },
      writable: true
    },

    /**
     * Behavior-updater meant to be called from scene render.
     * Abstracted to a different function to facilitate unit testing (`scene.tick()`) without
     * needing to render.
     */
    argonPostRender: {
      value: function (frame) {
          var time = frame.timestamp;
          var timeDelta = frame.deltaTime;

          if (this.isPlaying) {
              this.tock(time, timeDelta);
          }

          this.time = time;   
      },
      writable: true
    },

    /**
     * Behavior-updater meant to be called from scene render.
     * Abstracted to a different function to facilitate unit testing (`scene.tick()`) without
     * needing to render.
     */
    tick: {
      value: function (time, timeDelta) {
        var systems = this.systems;
        // Animations.
        TWEEN.update();

        // Components.
        this.behaviors.tick.forEach(function (component) {
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
     * Behavior-updater meant to be called after scene render for post processing purposes.
     * Abstracted to a different function to facilitate unit testing (`scene.tock()`) without
     * needing to render.
     */
    tock: {
      value: function (time, timeDelta) {
        var systems = this.systems;

        // Components.
        this.behaviors.tock.forEach(function (component) {
          if (!component.el.isPlaying) { return; }
          component.tock(time, timeDelta);
        });
        // Systems.
        Object.keys(systems).forEach(function (key) {
          if (!systems[key].tock) { return; }
          systems[key].tock(time, timeDelta);
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
        var self = this;
        var behaviors = this.behaviors;
        // Check if behavior has tick and/or tock and remove the behavior from the appropriate array.
        Object.keys(behaviors).forEach(function (behaviorType) {
          if (!behavior[behaviorType]) { return; }
          var behaviorArr = self.behaviors[behaviorType];
          var index = behaviorArr.indexOf(behavior);
          if (index !== -1) {
            behaviorArr.splice(index, 1);
          }
        });
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

/**
 * Determines if renderer anti-aliasing should be enabled.
 * Enabled by default if has native WebVR or is desktop.
 *
 * @returns {bool}
 */
function shouldAntiAlias (sceneEl) {
  // Explicitly set.
  if (sceneEl.getAttribute('antialias') !== null) {
    return sceneEl.getAttribute('antialias') === 'true';
  }

  // Default not AA for mobile.
  return !sceneEl.isMobile;
}

},{"../node_modules/aframe/src/constants/":3}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
AFRAME.registerComponent('css-object', {
  schema: {
    div: { default: '' },
    div2: { default: ''}
  },

  init: function () {
    this.div = null;
    this.div2 = null;
  },

  update: function () {
    var data = this.data;
    if (data.div === "") { return; }

    this.div = document.querySelector(data.div);
    if (data.div2 !== "") {
      this.div2 = document.querySelector(data.div2);
    }
    if (this.div) {
        if (THREE.CSS3DObject) {
          if (this.div2 === null) {
            this.el.setObject3D('div', new THREE.CSS3DObject(this.div));
          } else {
            this.el.setObject3D('div', new THREE.CSS3DObject([this.div, this.div2]));
          }
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

},{}],12:[function(require,module,exports){
AFRAME.registerComponent('panorama', {
    multiple: true,

    schema: {
        src: {type: 'src'},
        lla: {type: 'vec3'},
        initial: {default: false},
        offsetdegrees: {default: 0},
        easing: {default: "Quadratic.InOut"},
        duration: {default: 500}
    },

    init: function () {
        var el = this.el;

        this.name = "default";
        this.active = false;
        this.panoRealitySession = undefined;
        this.panorama = undefined;
        this.showOptions = undefined;

        if (!el.isArgon) {
            console.warn('panorama should be attached to an <ar-scene>.');
        } else {
            el.argonApp.reality.connectEvent.addEventListener(this.realityWatcher.bind(this));
            el.addEventListener("showpanorama", this.showPanorama.bind(this));
        }
    },

    update: function (oldData) {
        this.name = this.id ? this.id : "default";

        this.panorama = {
            name: this.name,
            url: Argon.resolveURL(this.data.src),
            longitude: this.data.lla.x,
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

},{}]},{},[1]);
