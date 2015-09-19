module.exports = function (grunt) {

  grunt.initConfig({
    release: {
      options: {
        changelog: false,
        add: true,
        commit: true,
        tag: false,
        push: true,
        pushTags: false,
        npm: true,
        npmtag: false,
        commitMessage: '[AxiCLI] Release Commit <%= version %>',
        tagMessage: 'Release Build <%= version %>',
        github: {
          repo: 'vasumahesh1/axicli',
          accessTokenVar: 'GITHUB_ACCESS_TOKEN'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-release');


};