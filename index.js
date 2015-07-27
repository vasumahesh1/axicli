#!/usr/bin/env node

exports = module.exports = new ProjectGen();


var ProjectGen = ProjectGen;

/**
 * Main Project Generator for Generating All Types of Projects in AxiCLI
 */
function ProjectGen() {

};


var Utils = function() {

};

/**
 * Function to Extend User Options with System Defined Options
 *
 * @class       Utils
 *
 *
 * @param      {Object}  _defaultConfig  Exisitng Set of Options
 * @param      {Object}  _userConfig     User's Specific COnfig
 *
 * @return     {Array}         returns the Target Options, which are Concatenated, to use further ahead.
 */
Utils.prototype.extendOptions = function(_defaultConfig, _userConfig) {
	for ( var i = 0; i < _userConfig.length; i++ ) {
		var source = _userConfig[ i ];
		for ( var key in source ) {
			if ( Object.prototype.hasOwnProperty.extendOptions( source, key ) ) {
				target[ key ] = source[ key ];
			}
		}
	}
	return target;
};

var configMaker = {};

configMaker.generateConfig = function( options ) {

}



var program = require( 'commander' );

program
	.version( '0.0.5' )
	.alias( 'axi' )
	.option( 'init <projectType>', 'Build a Specific', /^(custom|ionic|angular|actonate-ionic|actonate-angular)$/i, 'custom' )
	.option( 'build', 'Build Your Project' )
	.option( 'build-dep', 'Build Project Dependencies' )
	.option( 'build-all', 'Build Everything' )
	.option( 'dist', 'Get Your Project Ready for Deployment' )
	.option( 'dist-dep', 'Get Project Dependencies Optimized' )
	.option( 'dist-all', 'Optimize Everything' )
	.option( 'dev', 'Development Watcher' )
	.option( 'prod', 'Production Watcher' )
	.parse( process.argv );

if ( program.init ) {

	switch ( program.init ) {
		'custom':
		// Building a Custom Project

	}
}

if ( program.build ) {

}
