/* jshint laxcomma: true*/

module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
      , cafemocha: {
            src: 'test/*.js'
          , options: {
                ui: 'tdd'
              , reporter: 'spec'
            }
        }
      , release: {
            options: {
                commitMessage: 'Bump version to <%= version %>'
            }
        }
      , jshint: {
            all: ['lib/**/*.js', 'bin/**/*.js']
          , options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-cafe-mocha');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['cafemocha']);
    grunt.registerTask('default', ['jshint', 'test']);
};
