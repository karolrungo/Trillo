var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');
var htmlMin = require('gulp-htmlmin');
var del = require('del');
var sequence = require('run-sequence');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var deploy = require('gulp-gh-pages');

var config = {
  dist: 'dist/',
  src: 'src/',
  cssin: 'src/css/**/*.css',
  jsin: 'src/js/**/*.js',
  imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
  htmlin: 'src/*.html',
  scssin: 'src/sass/**/*.scss',
  cssout: 'dist/css/',
  jsout: 'dist/js/',
  imgout: 'dist/img/',
  htmlout: 'dist/',
  scssout: 'src/css/',
  cssoutname: 'style.css',
  jsoutname: 'script.js',
  cssreplaceout: 'css/style.css',
  jsreplaceout: 'js/script.js',
  fontsIn: 'src/css/fonts/**/*',
  fontsOut: 'dist/css/fonts',
  svgIn: 'src/img/**/*.svg',
  svgOut: 'dist/img/',
  
};

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('serve', ['sass'], function() {
  browserSync({
    server: config.src
  });

  gulp.watch([config.htmlin, config.jsin], ['reload']);
  gulp.watch(config.scssin, ['sass']);
});

gulp.task('sass', function() {
  return gulp.src(config.scssin)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
    }))
    .pipe(sourcemaps.write())
    .pipe(rename(config.cssoutname))
    .pipe(gulp.dest(config.scssout))
    .pipe(browserSync.stream());
});

gulp.task('css', function() {
  return gulp.src(config.cssin)
    .pipe(plumber())
    .pipe(concat(config.cssoutname))
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.cssout));
});

gulp.task('js', function() {
    return gulp.src(config.jsin)
    .pipe(plumber())
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(concat(config.jsoutname))
    .pipe(uglify())
    .pipe(gulp.dest(config.jsout));
});

gulp.task('img', function() {
  return gulp.src(config.imgin)
    .pipe(plumber())
    .pipe(changed(config.imgout))
    .pipe(imagemin())
    .pipe(gulp.dest(config.imgout));
});

gulp.task('html', function() {
  return gulp.src(config.htmlin)
    .pipe(plumber())
    .pipe(htmlMin({
      sortAttributes: true,
      sortClassName: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.dist))
});

gulp.task('fonts', function() {
    return gulp.src(config.fontsIn)
            .pipe(gulp.dest(config.fontsOut));
});

gulp.task('svg', function() {
  return gulp.src(config.svgIn)
          .pipe(gulp.dest(config.svgOut));
});


gulp.task('clean', function() {
  return del([config.dist]);
});

gulp.task('build', function() {
  sequence('clean', ['html', 'js', 'css', 'img', 'fonts', 'svg']);
});

gulp.task('default', ['serve']);

gulp.task('deploy', function () {
  return gulp.src(config.dist + '/**/*')
    .pipe(deploy())
});