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
          'dist/collectiondevelopment.min.js': ['dist/concatted.js']
        }
      }
    },
    concat: {
      target: {
        src: ['src/*.js'],
        dest: 'dist/concatted.js'
      }
    },
    qunit: {
      all: ['src/tests/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Default task(s).
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('tests', ['qunit']);

};