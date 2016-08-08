/**
 * @author mrdoob / http://mrdoob.com/
 * @author blairmacintyre / http://blairmacintyre.me/
 */

// based on CSS3DStereoRenderer in threejs.org github repo

THREE.CSS3DObject = function ( element ) {
	THREE.Object3D.call( this );

	this.elements = [];
	if (Array.isArray(element)) {
		for (var i =0; i <element.length; i++) {
			this.elements[i] = element[i];
		}
	} else {
		this.elements[0] = element;
		this.elements[1] = element.cloneNode( true );
	}

	this.elements.forEach(function(el){
		el.style.position = 'absolute';
	});

	this.addEventListener( 'removed', function ( event ) {
		for (var i =0; i <this.elements.length; i++) {
			if ( this.elements[i].parentNode !== null ) {
				this.elements[i].parentNode.removeChild( this.elements[i] );
			}
		}
	} );

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

THREE.CSS3DSprite = function ( element ) {
	THREE.CSS3DObject.call( this, element );
};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );
THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;

//

THREE.CSS3DArgonRenderer = function () {

	console.log( 'THREE.CSS3DArgonRenderer', THREE.REVISION );

	var _cameras = [];

	var _width, _height;	
	var _viewWidth = [];
	var _viewHeight = [];

	var tempMatrix = new THREE.Matrix4();
    var tempMatrix2 = new THREE.Matrix4();

	var cache = {
		camera: { fov: [], style: [] },
		objects: {}
	};
	
	//

	var domElement = document.createElement( 'div' );
	this.domElement = domElement;
	domElement.style.pointerEvents = 'none';

	//
	
	var domElements = [];
	this.domElements = domElements;
	
	domElements[0] = document.createElement( 'div' );
	domElements[0].style.display = 'none'; // was 'inline-block';
	domElements[0].style.overflow = 'hidden';
	domElements[0].style.position = 'absolute';

	domElements[0].style.WebkitTransformStyle = 'preserve-3d';
	domElements[0].style.MozTransformStyle = 'preserve-3d';
	domElements[0].style.oTransformStyle = 'preserve-3d';
	domElements[0].style.transformStyle = 'preserve-3d';

	domElement.appendChild( domElements[0] );

	var cameraElements = [];
	cameraElements[0] = document.createElement( 'div' );
	cameraElements[0].style.WebkitTransformStyle = 'preserve-3d';
	cameraElements[0].style.MozTransformStyle = 'preserve-3d';
	cameraElements[0].style.oTransformStyle = 'preserve-3d';
	cameraElements[0].style.transformStyle = 'preserve-3d';

	domElements[0].appendChild( cameraElements[0] );

	//

	domElements[1] = document.createElement( 'div' );
	domElements[1].style.display = 'none'; // was 'inline-block';
	domElements[1].style.overflow = 'hidden';
	domElements[1].style.position = 'absolute';

	domElements[1].style.WebkitTransformStyle = 'preserve-3d';
	domElements[1].style.MozTransformStyle = 'preserve-3d';
	domElements[1].style.oTransformStyle = 'preserve-3d';
	domElements[1].style.transformStyle = 'preserve-3d';

	domElement.appendChild( domElements[1] );
 
	cameraElements[1] = document.createElement( 'div' );
	cameraElements[1].style.WebkitTransformStyle = 'preserve-3d';
	cameraElements[1].style.MozTransformStyle = 'preserve-3d';
	cameraElements[1].style.oTransformStyle = 'preserve-3d';
	cameraElements[1].style.transformStyle = 'preserve-3d';

	domElements[1].appendChild( cameraElements[1] );

	this.setClearColor = function () {

	};

    this.setViewport = function ( x, y, width, height, side ) {
		domElements[side].style.display = 'inline-block';
		domElements[side].style.top = y + 'px';
		domElements[side].style.left = x + 'px';
		domElements[side].style.width = width + 'px';
		domElements[side].style.height = height + 'px';

		cameraElements[side].style.width = width + 'px';
		cameraElements[side].style.height = height + 'px';
		
		_viewWidth[side] = width;
		_viewHeight[side] = height;
	}
		
	this.showViewport = function (side) {
		domElements[side].style.display = 'inline-block';
	}
	
	this.hideViewport = function (side) {
		domElements[side].style.display = 'none';
	}

	this.setSize = function ( width, height ) {
		// size of overall DOM
		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

		_width = width / 2;
		_height = height;

		/*
		 * do not reset the subviews.  
		 */ 		

		// hide them after setSize
		domElements[0].style.display = 'none';
		domElements[0].style.top = 0 + 'px';
		domElements[0].style.left = 0 + 'px';
		domElements[0].style.width = _width + 'px';
		domElements[0].style.height = _height + 'px';

		cameraElements[0].style.width = _width + 'px';
		cameraElements[0].style.height = _height + 'px';

		domElements[1].style.display = 'none';
		domElements[1].style.top = 0 + 'px';
		domElements[1].style.left = _width + 'px';
		domElements[1].style.width = _width + 'px';
		domElements[1].style.height = _height + 'px';

		cameraElements[1].style.width = _width + 'px';
		cameraElements[1].style.height = _height + 'px';
		/* */
	};

	var epsilon = function ( value ) {
		return toFixed(value, 6);
		//return toFixed(Math.abs( value ) < 0.00001 ? 0 : value, 6);
	};

	// make floating point output a little less ugly
	var toFixed = function(value, precision) {
    	const power = Math.pow(10, precision || 0);
    	return String(Math.round(value * power) / power);
	}

	var getCameraCSSMatrix = function ( m ) {
		var matrix = tempMatrix2;
		matrix.copy(m);
 		matrix.multiplyScalar(100);
		
		// we don't want the lower corner to be scaled, just the rest
		matrix.elements[15] = m.elements[15];

		var elements = matrix.elements;

		return 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( - elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( - elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( - elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	}; 

	var getObjectCSSMatrix = function ( m ) {
		var matrix = tempMatrix2;
		matrix.copy(m); 
 		matrix.multiplyScalar(100); 

		// we don't want the lower corner to be scaled, just the rest
		matrix.elements[15] = m.elements[15];

		var elements = matrix.elements;

		return 'translate3d(-50%,-50%,0) matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( - elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( - elements[ 6 ] ) + ',' +
			epsilon( - elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	};

	var renderObject = function ( object, camera, cameraElement, side, visible ) {
		visible = (visible && object.visible);

		if ( object instanceof THREE.CSS3DObject ) {
			var element = object.elements[side];
			
			if (visible === false) {
				element.style.display = "none";
			} else {
				element.style.display = "inline-block";				
			}
	
			var style;

			if ( object instanceof THREE.CSS3DSprite ) {

				// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/
				var matrix = tempMatrix;
				matrix.copy( camera.matrixWorldInverse );
				matrix.transpose();
				matrix.copyPosition( object.matrixWorld );
				matrix.scale( object.scale );

				matrix.elements[ 3 ] = 0;
				matrix.elements[ 7 ] = 0;
				matrix.elements[ 11 ] = 0;
				matrix.elements[ 15 ] = 1;

				style = getObjectCSSMatrix( matrix );

			} else {

				style = getObjectCSSMatrix( object.matrixWorld );

			}


			element.style.WebkitTransform = style;
			element.style.MozTransform = style;
			element.style.oTransform = style;
			element.style.transform = style;

			if ( element.parentNode !== cameraElement ) {

				cameraElement.appendChild( element );
			
			}
		}

		// we can't short circuit this, because we have to make sure we clear all the children of this 
		// hidden node
		// if (!object.visible) { return; }

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera, cameraElement, side, visible );

		}

	};

	this.render = function ( scene, camera, side ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		var fov = toFixed(
			0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _viewHeight[side],
			2);
		this.fovStyle = fov;

		if (cache.camera.fov[side] !== fov ) {
			domElements[side].style.WebkitPerspective = fov + "px";
			domElements[side].style.MozPerspective = fov + "px";
			domElements[side].style.oPerspective = fov + "px";
			domElements[side].style.perspective = fov + "px";

			cache.camera.fov[side] = fov;
		}

		domElements[side].style.display = 'inline-block'; 

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) +
			" translate3d(" + toFixed(_viewWidth[side]/2,4) + "px," + toFixed(_viewHeight[side]/2,4) + "px, 0)";

		if (cache.camera.style[side] !== style ) {
			cameraElements[side].style.WebkitTransform = style;
			cameraElements[side].style.MozTransform = style;
			cameraElements[side].style.oTransform = style;
			cameraElements[side].style.transform = style;

			cache.camera.style[side] = style;
		}

        renderObject( scene, camera, cameraElements[side], side, scene.visible);
	};
	
    // code to compute the FOV we need to render the CSS properly 
	// from an arbitrary projection matrix, needed if the camera
	// projectionMatrix has been set directly instead of being
	// computed from it's parameters.
    //
	var oldProjection = new THREE.Matrix4();
	var oldFOV = 0;
    var eps = 0.0000001;  // something small

    var epsilonEquals = function ( matrix ) {
		var te = oldProjection.elements;
		var me = matrix.elements;

		for ( var i = 0; i < 16; i ++ ) {
			if ( Math.abs(te[ i ] - me[ i ]) > eps ) {
                oldProjection.copy(matrix);
                return false;
            }
		}
		return true;
	}
    
	var applyProjection = function (x, y, matrix ) {
            var e = matrix.elements;
			// any depth will do, just use the middle of the canonical depth space
			var z = 0.5; 
            
            // for the perspective divide
            var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] ); 
            
            // do the minimal math
			var nx = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ] ) * d;
			var ny = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ] ) * d;
			var nz = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

			var len = Math.sqrt(nx * nx + ny * ny + nz * nz);
			return [nx/len, ny/len, nz/len];
	}

	var angleBetween = function(v1, v2) {
        // v1 and v2 are normalized above
		var dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

		// clamp, to handle numerical problems
		var theta = Math.max( -1, Math.min( 1, dot ) );
		return Math.acos( theta );
	}
    
    var projInv = new THREE.Matrix4();
    this.updateCameraFOVFromProjection = function( camera ) {        
        var projection = camera.projectionMatrix;

        // if it's different from what it was, update FOV
        if (!epsilonEquals(projection)) {
            console.log("get FOV: projection={" + projection[0] + ", " + projection[1]+", ...}")

            projInv.getInverse(camera.projectionMatrix);

            var v1 = applyProjection(0,1,projInv);
            console.log("get FOV: v1={" + v1[0] + ", " + v1[1]+", " + v1[2] +"}")
            var v2 = applyProjection(0,-1,projInv);
            console.log("get FOV: v2={" + v2[0] + ", " + v2[1]+", " + v2[2] +"}")
		    oldFOV = angleBetween(v1,v2) * 180 / Math.PI;
            console.log("get FOV: " + oldFOV);
            
            camera.fov = oldFOV;
		}
	};
};