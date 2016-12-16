module.exports = function(grunt) {

var path = require('path');

//files for concat task !!! ORDER OF THE FILES IS IMPORTANT !!!
var javascriptFiles = [
    "public/libs/jquery/dist/jquery.min.js",
    "public/libs/angular/angular.min.js",
    "public/libs/angular-resource/angular-resource.min.js",
    "public/libs/angular-ui-router/release/angular-ui-router.min.js",
    "public/libs/angular-jwt/dist/angular-jwt.min.js",
    "public/libs/angular-animate/angular-animate.js",
    "public/libs/underscore/underscore-min.js",
    "public/libs/bootstrap/dist/js/bootstrap.min.js",
    "public/libs/angular-breadcrumb/dist/angular-breadcrumb.min.js",
    "public/libs/ngstorage/ngStorage.min.js",
    "public/libs/ng-img-crop-full-extended/compile/minified/ng-img-crop.js",
    "public/libs/angular-messages/angular-messages.js",
    "public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js",
    "public/libs/jquery-spinner/dist/jquery.spinner.min.js",
    "public/libs/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js",
    "public/libs/jquery-steps/build/jquery.steps.min.js",
    "public/libs/toastr/toastr.min.js",
    "public/libs/bootstrap-file-input/bootstrap.file-input.js",
    "public/libs/jquery.slimscroll/jquery.slimscroll.min.js",
    "public/libs/holderjs/holder.js",
    "public/libs/raphael/raphael-min.js",
    "public/libs/morris.js/morris.js",
    "public/vendors/responsive-tables.js",
    "public/vendors/jquery.sparkline.min.js",
    "public/libs/flot/jquery.flot.js",
    "public/libs/flot/jquery.flot.resize.js",
    "public/libs/flot/jquery.flot.pie.js",
    "public/libs/flot/jquery.flot.stack.js",
    "public/libs/flot.tooltip/js/jquery.flot.tooltip.min.js",
    "public/libs/flot/jquery.flot.time.js",
    "public/libs/gauge.js/dist/gauge.min.js",
    "public/libs/jquery.easy-pie-chart/dist/angular.easypiechart.min.js",
    "public/libs/angular-wizard/dist/angular-wizard.min.js",
    "public/vendors/skycons.js",
    "public/libs/ngDraggable/ngDraggable.js",
    "public/libs/angular-embedly/angular-embedly.js",
    "public/libs/angular-embed/dist/angular-embed.js",
    "public/libs/ng-file-upload-shim/ng-file-upload-shim.js",
    "public/libs/ng-file-upload/ng-file-upload.js",
    "public/libs/jquery-ui/ui/core.js",
    "public/libs/jquery-ui/ui/widget.js",
    "public/libs/jquery-ui/ui/mouse.js",
    "public/libs/jquery-ui/ui/sortable.js",
    "public/libs/angular-ui-sortable/sortable.js",
    "public/libs/angular-loading-bar/build/loading-bar.min.js",
    "public/libs/bootstrap-tour/build/js/bootstrap-tour-standalone.min.js",
    "public/libs/angular-payments/lib/angular-payments.min.js",
    "public/libs/angular-payments/lib/angular-payments.min.js",
    "public/libs/angular-translate/angular-translate.min.js",
    "public/libs/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js",
    "public/libs/ng-tags-input/ng-tags-input.min.js",
    "public/vendors/angulartics.min.js",
    "public/vendors/angulartics-ga.min.js",
    'public/libs/textAngular/dist/textAngular-rangy.min.js',
    'public/vendors/textAngular/textAngular-sanitize.js',
    'public/libs/textAngular/dist/textAngular.min.js',
    'public/libs/KaTeX/dist/katex.min.js',
    'public/libs/KaTeX/dist/contrib/auto-render.min.js',
    "public/libs/angular-katex/angular-katex.js",
    "public/libs/videogular/videogular.js",
    "public/libs/videogular-controls/vg-controls.js",
    "public/libs/angular-audio/app/angular.audio.js",
    "public/libs/sweetalert/dist/sweetalert.min.js",
    "public/libs/ngSweetAlert/SweetAlert.js",
    "public/libs/lodash/dist/lodash.min.js",
    'public/js/*.js',
    'public/js/**/*.js'
];

var cssFiles = [
    "public/libs/ng-img-crop-full-extended/compile/minified/ng-img-crop.css",
    "public/libs/font-awesome/css/font-awesome.min.css",
    "public/libs/weather-icons/css/weather-icons.min.css",
    'public/libs/angular-loading-bar/build/loading-bar.min.css',
    "public/libs/sweetalert/dist/sweetalert.css",
    "public/libs/morris.js/morris.css",
    "public/libs/ng-tags-input/ng-tags-input.min.css",
    "public/libs/ng-tags-input/ng-tags-input.bootstrap.min.css",
    "public/libs/bootstrap-tour/build/css/bootstrap-tour-standalone.css",
    'public/libs/textAngular/dist/textAngular.css',
    "public/libs/KaTeX/dist/katex.min.css",
    "public/styles/css/main.css",
    "public/css/style.css",
];

// Project configuration.
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
        compass: {
            files: ['public/styles/**/*.{scss,sass}'],
            tasks: ['compass:dev']
        }
    },
    compass: {
        dev: {
        options: {              
          sassDir: ['public/styles/sass'],
          cssDir: ['public/styles/css/'],
                environment: 'development'    
                }
        },
        prod: {
            options: {              
                sassDir: ['public/styles/sass'],
                cssDir: ['public/styles/css'],
                environment: 'production'     
            }
        }
    },
    uglify: {
        all: {
            files: {
                'JS/min/main.min.js': [
                'JS/libs/jquery.js', 
                'JS/main.js'
                ]
            }
        }
    },
    concat: {
        options: {
          separator: grunt.util.linefeed + ';' + grunt.util.linefeed,
        },
        js: {
          src: javascriptFiles,
          dest: 'public/build/app.js',
        },
        // css: {
        //   src: cssFiles,
        //   dest: 'public/build/app.css',
        // },
    },
    protractor: {
        options: {
            configFile: "test/protractor.conf.js",
            noColor: false,
            args: { }
        },
        all: {
            options: {
                keepAlive: true
            }
        }
    },
    express: {
        test: {
            options: {
                script: 'server.js',
                node_env: 'test',
                port: 8081,
                background: true
            }
        }
    },
    run: {
        e2eSetup: {
            args: [
                'test/e2eSetup.js'
            ]
        },
        e2eCleanup: {
            args: [
                'test/e2eCleanup.js'
            ]
        }
    }
});

// Load the plugin
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-compass');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-express-server');
grunt.loadNpmTasks('grunt-protractor-runner');
grunt.loadNpmTasks('grunt-run');

// Default task(s).
grunt.registerTask('default', ['compass:dev' , 'watch']);
// prod build
grunt.registerTask('prod', ['compass:prod']);

grunt.registerTask('test', ['run:e2eSetup', 'express:test', 'protractor:all']);

};