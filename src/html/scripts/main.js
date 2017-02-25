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
    DIRECTIONS = [ "hide-up", "hide-left", "hide-right", "hide-down" ],

		// DOM Elements
		docBody = document.body,
		deck = document.getElementById( 'deck' ),
		world = document.getElementById( 'deck' ),
		cards = deck.getElementsByClassName( 'card' ),
		//world = document.getElementById( 'content' ),
		touchEvents = new Hammer( world, {} ),

		isActive = true,
		isBusy = false,
		deckSize = deck.children.length - 1,
		remaining = deckSize,
		idleSecondsCounter = 0,
		timer = -1,
    limiter = -1,

		// world transformations
		x = 0,
		y = 0,
		z = 0,
		currentTransform = 'translateZ( '+z+'px ) rotateX( '+x+'deg) rotateY( '+y+'deg)';


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
		}


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
	}

	// Moves all the LI elements around in the deck
	function shuffleDeck( )
	{
    for (var i = deckSize; i >= 0; --i)
		{
			var kid = deck.children[ Math.random() * i | 0 ];
			deck.appendChild( kid );
		}
    cards = deck.getElementsByClassName( 'card' );
	}

	// Reset the UI
	function reset( shuffle )
	{
    if (shuffle) shuffleDeck();

		for (var i = deckSize; i >= 0; --i)
		{
			var kid = deck.children[ i ];
			kid.className = 'card card-'+(deckSize-i+1);
		}
    remaining = deckSize;
	}

	// Some handy methods with older browser support
	function hasClass(elem, className)
	{
		if (elem.classList) return elem.classList.contains(className);
		else return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
	}

	function addClass(elem, className)
	{
		if (elem.classList) return elem.classList.add(className);
		if (!hasClass(elem, className))
		{

			if ( elem.className.length === 0 ) elem.className += className;
			else elem.className += ' ' + className;
		}
	}

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
	}

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
	}

  function getRandomDirection()
  {
    return DIRECTIONS[ Math.round(Math.random() * (DIRECTIONS.length-1)) ];
  }
  function determineDirection(percentageX, percentageY)
  {
    if (percentageX >= 0.65)
    {
      return Hammer.DIRECTION_RIGHT;
    }
    if (percentageX <= 0.35)
    {
      return Hammer.DIRECTION_LEFT;
    }
    // determine direction...
    if (percentageX > 0.25 && percentageX < 0.75 && percentageY < 0.5)
    {
      return Hammer.DIRECTION_UP;
    }
    if (percentageX > 0.25 && percentageX < 0.75 && percentageY >= 0.5)
    {
      return Hammer.DIRECTION_DOWN;
    }

    return getRandomDirection();
  }

  function debounce()
  {
    clearInterval(limiter);
    limiter = setTimeout( onDelayed, 500 );
  }

  function swipeNextCard( direction )
  {
    var card = cards[ deckSize-remaining ];
    switch( direction )
		{
			case Hammer.DIRECTION_UP :
				addClass( card, "hide-up" );
				break;

			case Hammer.DIRECTION_LEFT :
				addClass( card, "hide-left" );
				break;

			case Hammer.DIRECTION_RIGHT :
				addClass( card, "hide-right" );
				break;

			case Hammer.DIRECTION_DOWN :
				addClass( card, "hide-down" );
				break;

			default:
      //
				addClass( card, getRandomDirection() );
		}
    // remove remaining or end...
    if  (remaining > 0)
    {
      remaining--;
      onCardInteraction(card);
    }else{
      // No more cards!
      onDeckEmpty();
    }
  }
	// EVENTS! ==========================================================


  function onCardInteraction(card)
  {
    console.log(card);
  }
  function onDeckEmpty()
  {
    console.log("onDeckEmpty of card");
    reset(true);
  }

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
			reset( true );
			return;
		}

    swipeNextCard();
	}

	function onMouseWheel(event)
	{
    onUserActive();
		event = event ? event : window.event;	// event may be empty so use as fallback
		z = z-( event.detail ? event.detail*-5 : event.wheelDelta/8 );
		update();

		if (event.preventDefault) event.preventDefault();
		return false;
	}

	function onMouseMove(event)
	{
    onUserActive();
		x = ( 0.5 - ( event.clientY / window.innerHeight ) ) * 180;
		y = ( 0.5 - ( event.clientX / window.innerWidth ) ) * -180;
		update();
	}


	function onDrag( event )
	{
		var node = event.target;
    onUserActive();
		if ( node.nodeName.toLowerCase() != 'li' )
		{
			// rotate deck
			x += event.gesture.deltaX;
			y += event.gesture.deltaY;
      console.error( event.gesture, event);
      //x = ( 0.5 - ( event.clientY / window.innerHeight ) ) * 180;
  		//y = ( 0.5 - ( event.clientX / window.innerWidth ) ) * -180;
  		update();
		}else{
			onSwipe( event );
		}
	}

	function onDelayed( event )
  {
    isBusy = false;
  }

	function onSwipe( event )
	{
		var node = event.target;

		onUserActive();
		//console.log( "swipe isBusy;"+isBusy, event.target );

    if (isBusy)
    {
      return;
    }

		// check to see if there is a reload class...
		if ( hasClass( node, 'reload' )  ) return;

		// determine length and speed!

		// console.log(  event.gesture.direction + '   ' + Hammer.DIRECTION_UP );
    swipeNextCard(event.direction);

    isBusy = true;
    debounce();
	}

	function onTap( event )
	{
		onUserActive();

		// check to see if there is a reload class...
		if ( hasClass( event.target, 'reload' ) ) return;

    var percentageX = event.center.x / window.innerWidth;
    var percentageY = event.center.y / window.innerHeight;

		//console.log( "tap", event.target.nodeName, percentageX, percentageY );
    swipeNextCard( determineDirection(percentageX,percentageY) );
	}

	function onPinch( event )
	{
    onUserActive();
		// zoom in or out
		z += 0;
		update();
	}

	function onTilt( ax, ay )
	{
		x += ax;
		y += ay;
		update();
	}

	function onKeyDown( event )
	{
		// if the arrow keys are pushed, focus the viewport onto that layer...
		// layers[];
		onUserActive();
	}

	function onDOMReady()
	{
		reset(true);
		timer = window.setInterval(checkIdleTime, 1000);
		// remove class names from body
		removeClass( docBody, "loading" );
		console.log('LOADED ====================== ');
	}

	function onUserActive()
	{
		idleSecondsCounter = 0;
		if ( isActive ) return;
		isActive = true;
		removeClass( docBody, "inactive" );
		//console.log('ACTIVE ====================== ');
	}

	// User has not interacted for a little while, apply hidden class to DOM!
	function onUserInactive()
	{
		if (!isActive ) return;
		isActive = false;
		addClass( docBody, "inactive" );
		//console.log('INACTIVE ====================== ');
	}

	function checkIdleTime()
	{
		if ( idleSecondsCounter++ >= IDLE_TIMEOUT ) onUserInactive();
	}


  var shuffleButton = document.getElementById('shuffle');
  shuffleButton.onclick = function(){
    if (cards.length >1)
    {
      reset(true);
    }else{
      // goto a random page!
      window.location = "1.html";
    }

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
  touchEvents.get('pinch').set({ enable: true });
	touchEvents.on( "tap", onTap );
	touchEvents.on( "pan", onSwipe );
	touchEvents.on( "swipe", onSwipe );
	touchEvents.on( "drag", onDrag );
	touchEvents.on( "pinch", onPinch );
  // touchEvents.on("hammer.input", function(ev) {
  //    //console.log(ev.pointers[0]);
  // });
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
		window.addEventListener("MozOrientation", function (orientation) {
			onTilt([orientation.x * 50, orientation.y * 50]);
		}, true);
	}

	//onDOMReady();

})();
