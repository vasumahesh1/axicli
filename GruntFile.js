module.exports = function( grunt ) {

  var _extends = Object.assign || function( target ) {
    for ( var i = 1; i < arguments.length; i++ ) {
      var source = arguments[ i ];
      for ( var key in source ) {
        if ( Object.prototype.hasOwnProperty.call( source, key ) ) {
          target[ key ] = source[ key ];
        }
      }
    }
    return target;
  };

  var _axiConfig = grunt.file.readJSON( '.axirc' );
  var _dependenciesAllowed = [ "css", "js" ];

  var _projectDevDependencies = [];
  var _projectMinDependencies = [];

  var _userConfig = _axiConfig.directories;
  var _defaultConfig = {
    developmentFolder: "dev/app",
    applicationFolder: "www/app",
    lessFolder: "dev/less",
    cssFolder: "dev/css",
    libFolder: "dev/lib"
  };

  var _dependencies = _axiConfig.dependencies;
  var _buildOrder = _axiConfig.fileSpecs;

  if ( !_buildOrder[ "js" ][ "fileOrder" ] ) {
    _buildOrder[ "js" ][ "fileOrder" ] = "/**/*.js";
  }

  if ( !_buildOrder[ "css" ][ "fileOrder" ] ) {
    _buildOrder[ "css" ][ "fileOrder" ] = "/**/*.css";
  }

  for ( var _dependencyTypeKey in _dependencies ) {

    if ( _dependenciesAllowed.indexOf( _dependencies[ _dependencyTypeKey ] ) !== -1 ) {

      for ( var _dependency in _dependencies[ _dependencyTypeKey ] ) {
        if ( !_projectDevDependencies[ _dependencyTypeKey ] ) {
          _projectDevDependencies[ _dependencyTypeKey ] = [];
        }

        if ( !_projectMinDependencies[ _dependencyTypeKey ] ) {
          _projectMinDependencies[ _dependencyTypeKey ] = [];
        }

        if ( _dependencies[ _dependencyTypeKey ][ _dependency ].min ) {
          if ( _dependencies[ _dependencyTypeKey ][ _dependency ].dev ) {
            _projectDevDependencies[ _dependencyTypeKey ].push( _dependencies[ _dependencyTypeKey ][ _dependency ].dev );
          } else {
            _projectDevDependencies[ _dependencyTypeKey ].push( _dependencies[ _dependencyTypeKey ][ _dependency ].min );
            _projectMinDependencies[ _dependencyTypeKey ].push( _dependencies[ _dependencyTypeKey ][ _dependency ].min );
          }
        }
      }

    }
  }

  var _selectedConfig = _extends( _defaultConfig, _userConfig );


  grunt.initConfig( {
    gruntConfig: _selectedConfig,
    jsDevDependencies: _projectDevDependencies[ "js" ],
    cssDevDependencies: _projectDevDependencies[ "css" ],
    jsMinDependencies: _projectMinDependencies[ "js" ],
    cssMinDependencies: _projectMinDependencies[ "css" ],
    jsBuildOrder: _buildOrder[ "js" ][ "fileOrder" ],
    cssBuildOrder: _buildOrder[ "css" ][ "fileOrder" ],
    globalConfig: {
      developmentFolder: '<%= gruntConfig.developmentFolder %>',
      applicationFolder: '<%= gruntConfig.applicationFolder %>',
      lessFolder: '<%= gruntConfig.lessFolder %>',
      cssFolder: '<%= gruntConfig.cssFolder %>',
      libFolder: '<%= gruntConfig.libFolder %>',
      lessFiles: [
        '<%= globalConfig.lessFolder %>/**/*.less'
      ],
      cssFiles: [
        '<%= globalConfig.cssFolder %>/**/*.css'
      ],

      jsDevDependencies: [
        '<%= jsDevDependencies %>'
      ],

      jsMinDependencies: [
        '<%= jsMinDependencies %>'
      ],

      cssDevDependencies: [
        '<%= cssDevDependencies %>'
      ],

      cssMinDependencies: [
        '<%= cssMinDependencies %>'
      ],

      preBuildOrder: [],
      buildOrder: [
        '<%= globalConfig.developmentFolder %>/<%= jsBuildOrder %>'
      ],
      postBuildOrder: [],
      defaultBuildOrder: [
        '<%= globalConfig.preBuildOrder %>',
        '<%= globalConfig.buildOrder %>',
        '<%= globalConfig.postBuildOrder %>'
      ]
    },
    pkg: grunt.file.readJSON( 'package.json' ),
    uglify: {
      build: {
        options: {
          beautify: true,
          compress: false,
          preserveComments: true,
          mangle: false
        },
        src: [ '<%= globalConfig.defaultBuildOrder %>' ],
        dest: '<%= applicationFolder %>/main.min.js'
      },
      min: {
        options: {
          compress: {
            drop_console: true
          },
          mangle: false
        },
        src: [ '<%= globalConfig.defaultBuildOrder %>' ],
        dest: '<%= applicationFolder %>/main.min.js'
      },
      minDep: {
        options: {
          compress: {},
          mangle: false
        },
        src: [ '<%= globalConfig.jsDependencies %>' ],
        dest: 'www/app/dependencies.min.js'
      },
      buildDep: {
        options: {
          beautify: true,
          compress: false,
          preserveComments: true,
          mangle: false
        },
        src: [ '<%= globalConfig.jsDependencies %>' ],
        dest: 'www/app/dependencies.min.js'
      }
    },
    less: {
      build: {
        options: {
          plugins: [
            new( require( 'less-plugin-clean-css' ) )()
          ]
        },
        files: {
          "www/css/style.min.css": "<%= globalConfig.lessDir %>/style.less"
        }
      }
    },
    jshint: {
      files: [ 'Gruntfile.js', '<%= globalConfig.defaultBuildOrder %>' ],
      options: {
        'sub': true,
        'loopfunc': true
      }
    },
    concat: {
      dep: {
        src: [ '<%= globalConfig.cssDependencies %>' ],
        dest: "www/css/dependencies.min.css",
      },
    },
    ngtemplates: {
      app: {
        cwd: 'dev/',
        src: [ '<%= globalConfig.templates %>' ],
        dest: '<%= globalConfig.appDir %>/templates.js',
        options: {
          // [CHANGE] - Module Name
          module: "supr",
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true, // Only if you don't use comment directives!
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          }
        }
      }
    },
    watch: {
      dev: {
        files: [ 'Gruntfile.js', '<%= uglify.build.src %>', '<%= globalConfig.templatesDev %>', '<%= globalConfig.lessFiles %>' ],
        tasks: [ 'jshint', 'ngtemplates', 'uglify:build', 'less:build' ]
      },
      min: {
        files: [ 'Gruntfile.js', '<%= uglify.build.src %>', '<%= globalConfig.devFolder %>/<%= globalConfig.templates %>', '<%= globalConfig.lessFiles %>' ],
        tasks: [ 'jshint', 'ngtemplates', 'uglify:min', 'less:build' ]
      }

    }
  } );

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-angular-templates' );
  grunt.loadNpmTasks( 'grunt-contrib-less' );

  /**
   * Building Related Tasks
   * ----------------------------------------------------------------------------------------
   */

  // Build Only Development Files - Dependencies not Included
  // grunt.registerTask( 'build', [ 'jshint', 'ngtemplates', 'uglify:build', 'less:build' ] );
  grunt.registerTask( 'build', [ 'uglify:build' ] );
  // Build Only CSS
  grunt.registerTask( 'buildLess', [ 'less:build' ] );
  // Build Only Dependencies
  grunt.registerTask( 'buildDep', [ 'uglify:buildDep', 'concat:dep' ] );
  // Building Everything
  grunt.registerTask( 'buildAll', [ 'jshint', 'ngtemplates', 'uglify:build', 'less:build', 'uglify:buildDep', 'concat:dep' ] );

  /**
   * Minification Related Tasks
   * ----------------------------------------------------------------------------------------
   */

  // Minify Only Development Files - Doesn't Include Dependencies
  grunt.registerTask( 'min', [ 'jshint', 'ngtemplates', 'uglify:min', 'less:build' ] );
  // Minify Only Dependencies
  grunt.registerTask( 'minDep', [ 'uglify:minDep', 'concat:dep' ] );
  // Minify Everything
  grunt.registerTask( 'minAll', [ 'jshint', 'ngtemplates', 'uglify:min', 'less:build', 'uglify:minDep', 'concat:dep' ] );

  /**
   * Watchers Related Tasks
   * ----------------------------------------------------------------------------------------
   */

  // Watcher for Dev
  grunt.registerTask( 'dev', [ 'watch:dev' ] );

  // Watcher for Hot Fixes (Instant Minification on Watch)
  grunt.registerTask( 'minDev', [ 'watch:min' ] );

};
