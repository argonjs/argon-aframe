/**
 * @author mrdoob / http://mrdoob.com/
 * @author blairmacintyre / http://blairmacintyre.me/
 */

THREE.CSS3DArgonHUD = function () {

	console.log( 'THREE.CSS3DArgonHUD', THREE.REVISION );

	var _viewWidth = [];
	var _viewHeight = [];

	var domElement = document.createElement( 'div' );
	this.domElement = domElement;
	this.domElement.style.pointerEvents = 'none';

	var hudElements = [];
	this.hudElements = hudElements;
	hudElements[0] = document.createElement( 'div' );
	hudElements[0].style.display = 'none'; // start hidden
	hudElements[0].style.position = 'absolute';
	hudElements[0].style.overflow = 'hidden';
	domElement.appendChild( hudElements[0] );

	hudElements[1] = document.createElement( 'div' );
	hudElements[1].style.display = 'none'; // start hidden
	hudElements[1].style.position = 'absolute';
	hudElements[1].style.overflow = 'hidden';
	domElement.appendChild( hudElements[1] );

	this.appendChild = function (element, element2) {
		if (!element2) {
			element2 = element.cloneNode( true );
		}
		this.hudElements[0].appendChild(element);
		this.hudElements[1].appendChild(element2);
	}

    this.setViewport = function ( x, y, width, height, side ) {
		hudElements[side].style.display = 'inline-block';
		hudElements[side].style.top = y + 'px';
		hudElements[side].style.left = x + 'px';
		hudElements[side].style.width = width + 'px';
		hudElements[side].style.height = height + 'px';

		_viewWidth[side] = width;
		_viewHeight[side] = height;
	}
		
	this.showViewport = function (side) {
		hudElements[side].style.display = 'inline-block';
	}
	
	this.hideViewport = function (side) {
		hudElements[side].style.display = 'none';
	}

	this.setSize = function ( width, height ) {
		// size of overall DOM
		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

		/*
		 * do not reset the subviews.  
		 */ 		
		// default viewports for left and right eyes.
		hudElements[0].style.display = 'none';
		hudElements[1].style.display = 'none';
	};

	this.render = function ( side ) {
		hudElements[side].style.display = 'inline-block';
	};
};