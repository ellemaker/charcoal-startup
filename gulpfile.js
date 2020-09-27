'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const packageImporter = require('node-sass-package-importer');
const merge = require('merge-stream');
const cleanCSS = require('gulp-clean-css');


const { src, parallel, watch, series } = require('gulp');



const source = {
    sass: {
        plugins: './src/sass/plugins/*.scss',
        custom: './src/sass/*.scss'
    },
    css: {
        plugins: ['./node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css']
    },
    images: './src/images/**/*.{jpg,jpeg,png,svg,gif}',
    script: {
        jquery: './node_modules/jquery/dist/jquery.min.js',
        all: [
            './node_modules/mmenu-js/dist/mmenu.js',
            './node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js',
            './node_modules/slick-carousel/slick/slick.min.js',
            './src/scripts/plugins.js',
            './src/scripts/app.js'
        ]
    }
}

const assets = {
    css: './assets/css/',
    script: './assets/js/',
    images: './assets/images/'
}


function stylePluginsTask() {

    var sassPlugin = gulp.src(source.sass.plugins)
        .pipe(sass({
            includePaths: ['node_modules']
        }).on('error', sass.logError));

    var cssPlugin = gulp.src(source.css.plugins);

    return merge(sassPlugin, cssPlugin)
        .pipe(concat('plugins.css'))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest(assets.css));
}

function styleCustomTask() {
    return gulp.src(source.sass.custom)
        .pipe(sass({
            includePaths: ['node_modules']
        }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(assets.css));
}


function jQueryTask() {
    return gulp.src(source.script.jquery)
        .pipe(gulp.dest(assets.script));
}

function scriptTask() {
    return gulp.src(source.script.all)
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(assets.script));
}

exports.scriptTask = scriptTask;


function minifyImage() {
    return src(source.images)
        .pipe(imagemin())
        .pipe(gulp.dest(assets.images));
}

exports.minifyImage = minifyImage;


function watchTask() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    // var newSrc = source.css.plugins.push('./assets/css/plugins.css');

    gulp.watch('./*.html').on('change', browserSync.reload);
    gulp.watch(source.sass.plugins, stylePluginsTask).on('change', browserSync.reload);
    gulp.watch(source.sass.custom, styleCustomTask).on('change', browserSync.reload);
    gulp.watch(source.script.all, scriptTask).on('change', browserSync.reload);

}
exports.default = series(jQueryTask, stylePluginsTask, styleCustomTask, scriptTask, watchTask);



// "gulp deploy" if you want to minify css/js/images
exports.deploy = parallel(minifyImage, watch);

