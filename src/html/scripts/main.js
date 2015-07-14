
(function() {
	"use strict";
	
	/*
		Defining our variables
        world and viewport are DOM elements,
        x and y and z are floats that hold the world rotations,
        d is an int that defines the distance of the world from the camera 
	*/
	var 
		IDLE_TIMEOUT = 5,	// seconds
		
		// DOM Elements 
		docBody = document.body,
		body = document.getElementById( 'body' ),
		world = document.getElementById( 'deck' ),
		touchEvents = Hammer( world ),
	
		isActive = true,
		idleSecondsCounter = 0,
		timer = -1,
		
		// world transformations
		x = 0,
		y = 0,
		z = 0,
		currentTransform = 'translateZ( '+z+'px ) rotateX( '+x+'deg) rotateY( '+y+'deg)';
	

 
	/*
		Changes the transform property of world to be
		translated in the Z axis by d pixels,
		rotated in the X axis by worldXAngle degrees and
		rotated in the Y axis by worldYAngle degrees.
		Warning : Expensive
	*/
	function update() 
	{
		if (!isActive) return;
		var transform = 'translateZ( '+z+'px ) rotateX( '+x+'deg) rotateY( '+y+'deg)';
		if ( currentTransform === transform ) return;
		currentTransform = transform;
		setTransform( world.style, transform );
		onUserActive();
	};
	
	// Browsers
	// sniff the browser
	// var IE6 = false /*@cc_on || @_jscript_version < 5.7 @*/
	// var IE7 = (document.all && !window.opera && window.XMLHttpRequest && navigator.userAgent.toString().toLowerCase().indexOf('trident/4.0') == -1) ? true : false;
	// var IE8 = (navigator.userAgent.toString().toLowerCase().indexOf('trident/4.0') != -1);
	// var IE9 = navigator.userAgent.toString().toLowerCase().indexOf("trident/5")>-1;
	// var IE10 = navigator.userAgent.toString().toLowerCase().indexOf("trident/6")>-1;
	// var SAFARI = (navigator.userAgent.toString().toLowerCase().indexOf("safari") != -1) && (navigator.userAgent.toString().toLowerCase().indexOf("chrome") == -1);
	// var CHROME = (navigator.userAgent.toString().toLowerCase().indexOf("chrome") != -1);
	// var MOBILE_SAFARI = ((navigator.userAgent.toString().toLowerCase().indexOf("iphone")!=-1) || (navigator.userAgent.toString().toLowerCase().indexOf("ipod")!=-1) || (navigator.userAgent.toString().toLowerCase().indexOf("ipad")!=-1)) ? true : false;
	var FIREFOX = (navigator.userAgent.toString().toLowerCase().indexOf("firefox") != -1);
	var OPERA = (navigator.userAgent.toString().toLowerCase().indexOf("opera")!=-1) ;
	function setTransform( element, transform )
	{
		element.webkitTransform = transform;
		if (FIREFOX) element.MozTransform = transform;
		if (OPERA) element.oTransform = transform;
	};
	
	// Moves all the LI elements around in the deck
	function shuffleDeck()
	{
		var ul = document.getElementById("deck");
		for (var i = ul.children.length - 1; i >= 0; --i)
		{
			var kid = ul.children[ Math.random() * i | 0 ];
			ul.appendChild( kid );
		}
	};
	
	// Reset the UI
	function reset()
	{
		for (var i = world.children.length - 1; i >= 0; --i)
		{
			var kid = world.children[ i ];
			kid.className = '';
		}
	};

	// Some handy methods with older browser support
	function hasClass(elem, className) 
	{
		if (elem.classList) return elem.classList.contains(className);
		else return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	};

	function addClass(elem, className) 
	{
		if (elem.classList) return elem.classList.add(className);
		if (!hasClass(elem, className)) 
		{
			
			if ( elem.className.length == 0 ) elem.className += className;
			else elem.className += ' ' + className;
		}
	};

	function removeClass(elem, className) 
	{
		if (elem.classList) return elem.classList.remove(className);
		// elem.className = elem.className.replace( /(?:^|\s)MyClass(?!\S)/g , '' )
		var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
		if (hasClass(elem, className)) {
			while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
				newClass = newClass.replace(' ' + className + ' ', ' ');
			}
			elem.className = newClass.replace(/^\s+|\s+$/g, '');
		}
	};
	
	function toggleClass(elem, className) 
	{
		if (elem.classList) return elem.classList.toggle(className);
		var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, " " ) + ' ';
		if (hasClass(elem, className)) {
			while (newClass.indexOf(" " + className + " ") >= 0 ) {
				newClass = newClass.replace( " " + className + " " , " " );
			}
			elem.className = newClass.replace(/^\s+|\s+$/g, '');
		} else {
			elem.className += ' ' + className;
		}
	};
	
	// EVENTS! ==========================================================
	
	function onMouseDown(e) 
	{
		e = e || window.event;
		
		if (e.target) targ = e.target;
		var el = e.target || e.srcElement;
		
		onUserActive();
		
		// defeat Safari bug
		if (el.nodeType == 3) el = el.parentNode;
		
		do {
			if (el.hasAttribute && el.hasAttribute("data-nofire")) {
				return;
			}
		} while (el = el.parentNode);
		
		
		//console.log('fire down!' + e.target.nodeName.toLowerCase()  + e.target.className );
		
		// check to see if there is a reload class...
		if ( hasClass( e.target, 'reload' )) 
		{
			reset();
			return;
		}
		
		// add our hidden class!
		if ( e.target.nodeName.toLowerCase() == 'li' )e.target.className = e.target.className + " hide";
	};
	
	function onMouseWheel(event)
	{
		event = event ? event : window.event;	// event may be empty so use as fallback
		z = z-( event.detail ? event.detail*-5 : event.wheelDelta/8 );
		update();
		
		if (event.preventDefault) event.preventDefault();
		return false;
	};
	
	function onMouseMove(event)
	{
		x = ( .5 - ( event.clientY / window.innerHeight ) ) * 180;
		y = ( .5 - ( event.clientX / window.innerWidth ) ) * -180;
		update();	
	};
	
	
	function onDrag( event )
	{
		var node = event.target;
	
		if ( node.nodeName.toLowerCase() != 'li' ) 
		{
			// rotate deck
			x += event.gesture.deltaX;
			y += event.gesture.deltaY;
			update();
		}else{
			onSwipe( event );
		}
	};
	
	function onSwipe( event )
	{
		console.log( event.target.nodeName );

		var node = event.target;
	
		onUserActive();
		
		// add our hidden class!
		if ( node.nodeName.toLowerCase() != 'li' )  return;
			
		// check to see if there is a reload class...
		if ( hasClass( node, 'reload' )  ) return;
		
		// determine length and speed!
		
		// console.log(  event.gesture.direction + '   ' + Hammer.DIRECTION_UP );
		
		
		switch( event.gesture.direction )
		{
			case Hammer.DIRECTION_UP :
				addClass( node, "hide-up" );
				break;
				
			case Hammer.DIRECTION_LEFT :
				addClass( node, "hide-left" );
				break;	
				
			case Hammer.DIRECTION_RIGHT :
				addClass( node, "hide-right" );
				break;	
				
			case Hammer.DIRECTION_DOWN :
				addClass( node, "hide-down" );
				break;	
				
			default:
				addClass( node, "hide" );
		}
		
	};
	
	function onTap( event )
	{
		onUserActive();
		console.log( event.target.nodeName );
		
		// check to see if there is a reload class...
		if ( hasClass( event.target, 'reload' ) ) return;
		
		// add our hidden class!
		if ( event.target.nodeName.toLowerCase() == 'li' ) addClass( event.target, "hide" );
	};
	
	function onPinch( event )
	{
		// zoom in or out
		z += 0;
		update();
	};
	
	function onTilt( ax, ay )
	{
		x += ax;
		y += ay;
		update();	
	};
	
	function onKeyDown( event )
	{
		// if the arrow keys are pushed, focus the viewport onto that layer...
		// layers[];
		onUserActive();
	};
	
	function onDOMReady()
	{
		shuffleDeck();
		timer = window.setInterval(checkIdleTime, 1000);
		// remove class names from body
		removeClass( docBody, "loading" );
		//console.log('LOADED ====================== ');
	};
	
	function onUserActive()
	{
		idleSecondsCounter = 0;
		if ( isActive ) return;
		isActive = true;
		removeClass( docBody, "inactive" );
		//console.log('ACTIVE ====================== ');
	};
	
	// User has not interacted for a little while, apply hidden class to DOM!
	function onUserInactive()
	{
		if (!isActive ) return;
		isActive = false;
		addClass( docBody, "inactive" );
		//console.log('INACTIVE ====================== ');
	};
	
	
	function checkIdleTime() 
	{
		if ( idleSecondsCounter++ >= IDLE_TIMEOUT ) onUserInactive();
	};
	
		
	// Now hook into our window events
	window.addEventListener('mousewheel',onMouseWheel, true); 
	// Event listener to transform mouse position into angles from -180 to 180 degress, both vertically and horizontally
	window.addEventListener('mousemove',onMouseMove, true); 
	// listen for key presses
	window.addEventListener('keypress',onKeyDown, true); 
	
	
	// watch also for key events and use the left and right arrow keys to focus the viewport onto that element :
	//document.body.addEventListener("click", onMouseDown, true);
	// watch for DOM elements to be available
	window.onload = onDOMReady;
	//var globalID = requestAnimationFrame( update );
	
	// hold
	// tap
	// doubletap
	// drag, dragstart, dragend, dragup, dragdown, dragleft, dragright
	// swipe, swipeup, swipedown, swipeleft, swiperight
	// transform, transformstart, transformend
	// rotate
	// pinch, pinchin, pinchout
	// touch (gesture detection starts)
	// release (gesture detection ends)
	touchEvents.on( "tap", onTap );
	touchEvents.on( "swipe", onSwipe );
	touchEvents.on( "drag", onDrag );
	touchEvents.on( "pinch", onPinch );
	
	// gyro!
	if (window.DeviceOrientationEvent) 
	{
		window.addEventListener("deviceorientation", function () {
			onTilt(event.beta, event.gamma);
		}, true);
	} else if (window.DeviceMotionEvent) {
		window.addEventListener('devicemotion', function () {
			onTilt(event.acceleration.x * 2, event.acceleration.y * 2);
		}, true);
	}else {
		window.addEventListener("MozOrientation", function () {
			onTilt([orientation.x * 50, orientation.y * 50]);
		}, true);
	}
		
	onDOMReady();
	
})();