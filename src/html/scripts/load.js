(function() {
	"use strict";
	
	var folder = "js/";
	
	// Give Modernizr.load a string, an object, or an array of strings and objects
	Modernizr.load([

	
		// Modernizer Test to see if we can use 3D transforms and if not,
		// Fall back to loading swfObject and the flash script
		{
			load: [
				folder+"vendor/hammer.min.js",
				folder+"main.js"
			]
		}
		// folder+"flash.js"
		// Run your analytics after you've already kicked off all the rest
		// of your app.
		// 'assets/js/analytics.js'
	]);
	
})();