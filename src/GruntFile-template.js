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

  var _userConfig = grunt.file.readJSON( '.axirc' );
  var _defaultConfig = {
    devFolder: 'dev',
    appFolder: 'app',
    lessFolder: 'less',
    libFolder: 'lib',
  };

  var selectedConfig = _extends(_defaultConfig, _userConfig);


  grunt.initConfig( {
    gruntConfig: selectedConfig,
    globalConfig: {
      appDir: '<%= gruntConfig.devFolder %>/<%= gruntConfig.appFolder %>',
      lessDir: '<%= gruntConfig.devFolder %>/<%= gruntConfig.lessFolder %>',
      libDir: '<%= gruntConfig.devFolder %>/<%= gruntConfig.libFolder %>',
      lessFiles: [
        '<%= globalConfig.lessDir %>/**/*.less'
      ],
      requiredMainFiles: [
        // '<%= globalConfig.appDir %>/main.js',
        // '<%= globalConfig.appDir %>/filters.js',
        // '<%= globalConfig.appDir %>/services.js',
        // '<%= globalConfig.appDir %>/directives.js',
        // '<%= globalConfig.appDir %>/templates.js'
      ],
      requiredAppBaseFiles: [
        // '<%= globalConfig.appDir %>/base/base.config.js',
        // '<%= globalConfig.appDir %>/base/base.ctrl.js'
      ],
      templates: [
        // '<%= globalConfig.appFolder %>/**/**/*.tpl.html',
        // '<%= globalConfig.appFolder %>/**/**/*.dir.html',
        // '<%= globalConfig.appFolder %>/**/**/*.mdl.html'
      ],

      // Drawback of Current Build System : Template Watching fails 
      // due to "cwd" of ngtemplates plugin
      templatesDev: [
        // '<%= globalConfig.appDir %>/**/**/*.tpl.html',
        // '<%= globalConfig.appDir %>/**/**/*.dir.html',
        // '<%= globalConfig.appDir %>/**/**/*.mdl.html'
      ],
      jsDependencies: [
        // '<%= globalConfig.libDir %>/ionic/js/ionic.bundle.min.js',
        // '<%= globalConfig.libDir %>/lodash/lodash.min.js',
        // '<%= globalConfig.libDir %>/restangular/src/restangular.js'
      ],
      cssDependencies: [
        // '<%= globalConfig.libDir %>/ionic/css/ionic.min.css'
      ],
      preBuildOrder: [],
      buildOrder: [
        '<%= globalConfig.appDir %>/*/*config*.js',
        '<%= globalConfig.appDir %>/*/*service*.js',
        '<%= globalConfig.appDir %>/*/*directive*.js',
        '<%= globalConfig.appDir %>/*/**/*ctrl*.js',
        '<%= globalConfig.requiredMainFiles %>',
        '<%= globalConfig.requiredAppBaseFiles %>'
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
        dest: 'www/app/main.min.js'
      },
      min: {
        options: {
          compress: {
            drop_console: true
          },
          mangle: false
        },
        src: [ '<%= globalConfig.defaultBuildOrder %>' ],
        dest: 'www/app/main.min.js'
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
  grunt.registerTask( 'build', [ 'jshint', 'ngtemplates', 'uglify:build', 'less:build' ] );
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
