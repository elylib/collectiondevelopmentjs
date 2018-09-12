module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        globals: {
          'jQuery': false,
          '$': false,
          'Chart': false,
          'document': false,
          'window': false
        },
        curly: true,
        eqeqeq: true,
        nonbsp: true,
        undef: true,
      },
      files: [ 'src/collectiondevelopment.js' ]
    },
    uglify: {
      options: {
        mangle: {
          except: ['jQuery']
        },
        drop_console: true,
        banner: '/*! WSU Collection Development - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      target: {
        files: {
          'dist/collectiondevelopment.js': ['dist/concatted.js']
        }
      }
    },
    concat: {
      prod: {
        files: {
          'dist/concatted.js': ['src/*.js']
        }
      },
      staging: {
        files: {
	    'dist/concatted-staging.js': ['src/*.js']
	}
      }
    },
    qunit: {
      all: ['src/tests/*.html']
    },
    'string-replace': {
      dist: {
        files: {
          'dist/collectiondevelopment_staging.js': ['dist/concatted-staging.js']
        }
      },
      options: {
      replacements: [{
        pattern: /collectiondevelopment.herokuapp/g,
	replacement: 'collection-development-staging.herokuapp'
	}]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-string-replace');
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'qunit', 'concat:prod', 'uglify']);
  grunt.registerTask('tests', ['qunit']);
  grunt.registerTask('staging', ['jshint', 'qunit', 'concat:staging', 'string-replace']);
};
