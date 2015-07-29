#!/usr/bin/env node

var fs = require( "fs" );
var colors = require( 'colors' );

var AxiConfig = ".axirc";
var GruntConfig = "GruntFile.js";
var GruntTemplatePath = "src/GruntFile-template.js";
var CommandConfig =  require( 'package.json' );

/**
 * Main Project Generator for Generating All Types of Projects in AxiCLI
 */
function ProjectGen() {
	this.projectConfig = null;
	fs.writeFileSync( AxiConfig, "" );
};

ProjectGen.prototype.GenerateBaseConfig = function( projectType ) {

	var _generateIonicProject = function() {

	};

	var _generateDefaultProject = function() {
		var baseConfig = {};

		baseConfig.dependencies = {};
		baseConfig.dependencies.js = [];
		baseConfig.dependencies.css = [];

		baseConfig.directories = {};
		baseConfig.directories.developmentFolder = "dev";
		baseConfig.directories.applicationFolder = "www/app";
		baseConfig.directories.lessFolder = "dev/less";
		baseConfig.directories.libFolder = "dev/lib";

		return baseConfig;
	};

	switch ( projectType ) {
		// case "ionic": 
		// 	break;

		default: Utils.logInfo( "Custom Project - Building Config ..." );
		this.projectConfig = _generateDefaultProject();
		break;
	}
};

ProjectGen.prototype.InstallGruntTemplate = function() {
	var _gruntData = fs.readFileSync( GruntTemplatePath );
	fs.writeFileSync( GruntConfig, _gruntData );
};

ProjectGen.prototype.WriteAxiConfig = function() {
	fs.writeFileSync( AxiConfig, JSON.stringify( this.projectConfig, null, '\t' ) );
};

ProjectGen.prototype.BuildConfig = function( projectType ) {
	this.GenerateBaseConfig( projectType );
	this.InstallGruntTemplate();
	this.WriteAxiConfig();
	Utils.log( "Please update .axirc file for customized directory structure for your project." );
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
Utils.prototype.extendOptions = function( _defaultConfig, _userConfig ) {
	for ( var configIndex = 0; configIndex < _userConfig.length; configIndex++ ) {
		var source = _userConfig[ configIndex ];
		for ( var key in source ) {
			if ( Object.prototype.hasOwnProperty.extendOptions( source, key ) ) {
				target[ key ] = source[ key ];
			}
		}
	}
	return target;
};

Utils.prototype.logError = function( message ) {
	console.log( message.red );
};

Utils.prototype.log = function( message ) {
	console.log( message );
};

Utils.prototype.logInfo = function( message ) {
	console.log( message.blue );
};

var Utils = new Utils();

var program = require( 'commander' );

program
	.version( CommandConfig.version )
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
	Utils.logInfo( "Starting New Project ..." );
	var ProjectGen = new ProjectGen();
	ProjectGen.BuildConfig( program.init );
}

if ( program.build ) {

}
