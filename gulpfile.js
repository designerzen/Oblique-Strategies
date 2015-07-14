/*

This handles the compilation of the source elements :

Less 			-> 		CSS 3
Jade 			-> 		HTML 5
JavaScript		-> 		JS ( Squished, uglified, concatanated )

*/

// =======================---------------- CONFIGURATION --------------------

var squish = false;

// Set up paths here (for this boilerplate, you should not have to alter these)
var SOURCE_FOLDER 			= 'src/html/';								// Source files Root
var BUILD_FOLDER 			= 'build/';									// Where the initial build occurs (debugable)
var DISTRIBUTION_FOLDER 	= 'dist/';									// Once debugging is complete, copy to server ready files here
var RELEASE_FOLDER 			= squish ? 'release/' : 'uncompressed/';	// Convert to distributable zips

// Where do our source files live?
var source = {
	// ensure that all scripts in the JS folder are compiled
	scripts : [ 
		SOURCE_FOLDER+'scripts/main.js' 
	],
	vendor: [ 
		//SOURCE_FOLDER+'scripts/load.js', 
		SOURCE_FOLDER+'scripts/**/*.js',
		'!' + SOURCE_FOLDER+'scripts/main.js' 
	],
	styles 	: SOURCE_FOLDER+'less/styles.less',
	jade 	: [ 
		SOURCE_FOLDER+'jade/*.jade', 
		'!'+SOURCE_FOLDER+'jade/*base.jade'
	],
	images	: SOURCE_FOLDER+'images/**/*.+(png|jpg|jpeg|gif|webp|svg)',
	fonts	: SOURCE_FOLDER+'fonts/**/*.+(svg|eot|woff|ttf|otf)'
};


// Where shall we compile them to?
var folders = {
	scripts : 'js',
	styles 	: 'css',
	html 	: '',
	images	: 'img',
	fonts	: 'fonts'
};

// Where shall we compile them to?
var getDestinations = function( dir ) {
	return {
		scripts : dir + folders.scripts,
		styles 	: dir + folders.styles,
		html 	: dir + folders.html,
		images	: dir + folders.images,
		fonts	: dir + folders.fonts
	};
};

// Files and folders to watch for changes in...
var watch = {
	scripts : SOURCE_FOLDER+'scripts/*.js',
	styles 	: SOURCE_FOLDER+'less/*.less',
	jade 	: SOURCE_FOLDER+'jade/*.jade',
	images	: SOURCE_FOLDER+'images/**/*',
	fonts	: SOURCE_FOLDER+'fonts/**/*'
};

var destination = getDestinations( BUILD_FOLDER );

// =======================---------------- IMPORT DEPENDENCIES --------------------

// Requirements for this build to work :
var console = require('better-console');		// sexy console output
var gulp = require('gulp');
var packageJson = require("./package.json");	// read in package.json!

var del = require('del');						// delete things and folders
var gulpif = require('gulp-if');				// conditional compiles

var newer = require('gulp-newer');				// deal with only modified files

var replace = require('gulp-replace');			// replace content within files
var fs = require('fs');							// read inside files
var rename = require('gulp-rename');			// rename files

var connect = require('gulp-connect');			// live reload capable server for files
var livereload = require('gulp-livereload');	// live reload

// How much to squish images by :
/* 
The optimization level 0 enables a set of optimization operations that require minimal effort. 
There will be no changes to image attributes like bit depth or color type, and no recompression of existing IDAT datastreams. 
The optimization level 1 enables a single IDAT compression trial. 
The trial chosen is what. OptiPNG thinks it’s probably the most effective. 
The optimization levels 2 and higher enable multiple IDAT compression trials; the higher the level, the more trials.

Level and trials:

    1 trial
    8 trials
    16 trials
    24 trials
    48 trials
    120 trials
    240 trials,
	// Additional plugins to use with imagemin.{ size:MAX_SIZE_JPEG }
	use: [jpegoptim()]
*/

var imageCrunchOptions = {
	// Select an optimization level between 0 and 7
	optimizationLevel: 3,
	// Lossless conversion to progressive
	progressive: false,
	// Interlace gif for progressive rendering.
	interlaced : false
};


// How much to squish HTML
// All options : https://github.com/kangax/html-minifier
var htmlSquishOptions = {
	removeComments     			: true,
	removeIgnored				: true,
	removeEmptyElements			: false,
	removeOptionalTags			: false,
	removeEmptyAttributes		: true,
	removeRedundantAttributes	: true,
	removeOptionalTags			: true,
	collapseWhitespace 			: true,
	minifyJS          			: true,
	keepClosingSlash   			: true
	//lint						: true
};

// =======================---------------- TASK DEFINITIONS --------------------

///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Clean
// ACTION 	: Deletes all files and folders specified in the arguments
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	del([BUILD_FOLDER,DISTRIBUTION_FOLDER,RELEASE_FOLDER], cb);//.on('error', function() { console.error('Could not delete the folder :('); });
});


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Jade
// ACTION 	: Compiles Jade files into HTML files in their relevant folders
//
///////////////////////////////////////////////////////////////////////////////////

// here we use the config file to determine how to output the html
gulp.task('jade', function() {
	var jade = require('gulp-jade');				// convert jade to html
	var htmlmin = require('gulp-htmlmin');			// squish html
	return 	gulp.src( source.jade )
			.pipe( gulpif( squish, jade( { pretty:false, debug:false, compileDebug:false } ), jade( { pretty:true, debug:false, compileDebug:false } ) ) )
			.pipe( gulpif( squish, htmlmin(htmlSquishOptions)) )	// ugly code but smaller
			.pipe( gulp.dest( destination.html ) );
});

///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Images
// ACTION 	: Compress images and copy to destinations
//
///////////////////////////////////////////////////////////////////////////////////

// Copy all static images & squish
gulp.task('images', function() {
	var imagemin = require('gulp-imagemin');		// squish images
	return 	gulp.src( source.images)
			.pipe( newer(destination.images) )
			.pipe( gulpif( squish, imagemin( imageCrunchOptions ) ) )
			.pipe( gulp.dest( destination.images ) );
});


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Cascading Style Sheets
// ACTION 	: Compiles a single Less files specified into a single CSS file
//
//.pipe( newer( destination.styles ) )
//		
///////////////////////////////////////////////////////////////////////////////////
gulp.task('less', function() {
	// CSS Plugins
	var less = require('gulp-less');				// compile less files to css
	var prefixer = require('gulp-autoprefixer');    // add missing browser prefixes
	// var sourcemaps = require('gulp-sourcemaps');    // create source maps for debugging!
	return 	gulp.src( source.styles )
			.pipe( newer( destination.styles ) )
			.pipe( gulpif( squish, less( {strictMath: false, compress: true }), less( {strictMath: false, compress: false }) ))	// ugly code but smaller
			.pipe( prefixer() )
            .pipe( gulp.dest( destination.styles ) );
});


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Copy
// ACTION 	: Makes duplicates of specified files in the destination folders
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('fonts',function(){
	return gulp.src( source.fonts )
	.pipe( newer( destination.fonts ) )
	.pipe( gulp.dest( destination.fonts ));
});
gulp.task('vendor',function(){
	return gulp.src( source.vendor )
	.pipe( newer( destination.scripts ) )
	.pipe( gulp.dest( destination.scripts ));
});


///////////////////////////////////////////////////////////////////////////////////
//
// TASK 	: Scripts
// ACTION 	: Compress and concantenate our Javascript files into one file
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('scripts', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    var uglify = require('gulp-uglify');            // squash 
	var jshint = require('gulp-jshint');			// lint!
	var concat = require('gulp-concat');			// combine files
	// var sourcemaps = require('gulp-sourcemaps');    // create source maps for debugging!
	return  gulp.src( source.scripts )
            .pipe( concat('main.js') )
    		.pipe( gulpif( squish, uglify() ) )
			.pipe( jshint('.jshintrc'))
			.pipe( jshint.reporter('default') )
            .pipe( gulp.dest( destination.scripts ) );
});


// Utilities ======================================================================

///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Watch BUILD
//
// Rerun the task when a file changes
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('watch', function() {
	
	// Watch any files in build/, reload on change
	gulp.watch( watch.scripts	, ['scripts'] );
	gulp.watch( watch.styles 	, ['less'] );
	gulp.watch( watch.jade  	, ['jade'] );
	gulp.watch( watch.images 	, ['images'] );
	gulp.watch( watch.fonts  	, ['copy'] );
	
});


///////////////////////////////////////////////////////////////////////////////////
//
// TASK : Serve
//
// Start a webserver and display the index file
//
///////////////////////////////////////////////////////////////////////////////////
gulp.task('server', function() {
  	connect.server({
		root: 'build',
		port:8080,
		livereload: true
  	});
});

///////////////////////////////////////////////////////////////////////////////////
// TASKS =====================================================
///////////////////////////////////////////////////////////////////////////////////

// compile all assets & create sourcemaps
gulp.task('build', 	[ 'less', 'jade', 'images', 'scripts','vendor', 'fonts' ] );

// create a server to host this project
gulp.task('serve', 		['build', 'server', 'watch'] );

// The default task (called when you run 'gulp' from cli)
gulp.task('default', [ 'build' ] );

console.clear();

/*
console.log, console.warn, console.error, console.info, console.debug, console.dir, console.trace
console.warn("Warning!");
console.info("Information");
console.table([ [1,2], [3,4] ]);
console.time("Timer");
console.timeEnd("Timer");
*/