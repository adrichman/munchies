(function(){

  'use strict';

  var gulp = require('gulp');
  var browserify = require('gulp-browserify');
  var mocha = require('gulp-mocha');
  var gutil = require('gulp-util');
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var less = require('gulp-less');
  var path = require('path');
  var sourcemaps = require('gulp-sourcemaps');
  var jshint  = require('gulp-jshint');
  var notify = require('gulp-notify');
  var spawn = require('child_process').spawn;

  var paths = {
    Munchies: [
      './public/*',
      '!public/javascripts/dist/*',
      '!public/javascripts/maps/*',
      '!public/stylesheets/dist/*',
      '!public/stylesheets/maps/*',
      './*.js',
      './*.json',
      './views/*.jade',
      './services/**/*.js',
      './routes/*.js',
      './bin/*',
      './apiSync/*.js',
      './public/javascripts/*.js',
      './public/javascripts/**/*.js',
      './public/javascripts/munchies-map/*.js',
      './public/stylesheets/*.less'
    ]
  };

  gulp.task('lint', function(){
    return gulp.src('./*')
      .pipe(jshint({
        globals: {}
      }))
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(notify({message: 'Linting done'}));
  });

  gulp.task('less', function(){
    return gulp.src('./public/stylesheets/*.less')
      .pipe(less())
      .pipe(gulp.dest('./public/stylesheets'));
  });

  gulp.task('javascript', function(){
    gulp.src([
      './public/javascripts/munchies-map/MunchiesMapView.js',
      './public/javascripts/munchies-map/MunchiesMap.js',
      './public/javascripts/munchies-map/MunchiesMapDragDelegate.js',
      './public/javascripts/munchies-map/MunchiesListView.js',
      './public/javascripts/munchies-map/MunchiesMapMarkerDelegateMethods.js',
      './public/javascripts/munchies-map/MunchiesMapMarkerDelegate.js'
      ])
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./public/javascripts/dist'));
  });

  gulp.task('uglify', function(){
    gulp.src('./public/javascripts/dist/app.js')
      .pipe(gulp.dest('./public/javascripts/dist/'));
  });

  gulp.task('mocha', function() {
      return gulp.src(['test/*.js'], { read: false })
          .pipe(mocha({ reporter: 'list' }))
          .on('error', gutil.log);
  });

  gulp.task('watch-mocha', function() {
      gulp.watch(['lib/**', 'test/**'], ['mocha']);
  });

  gulp.task('watch', function(){
    gulp.watch(paths.Munchies, ['less','mocha','lint','javascript', 'uglify'])
  });

  // gulp.task('browserify', function(){
  //   gulp.src('public/javascripts/munchies-map/index.js')
  //   .pipe(browserify({
  //     insertGlobals : true,
  //     debug : !gulp.env.production
  //   }))
  //   .pipe(gulp.dest('dist/js'))
  //   .pipe(gulp.dest('public/javascripts/dist'));
  // })
  
  // gulp.task('serve', function(){
  //   var child = spawn('./bin/www');
  //   var stdout = '';
  //   var stderr = '';

  //   child.stdout.setEncoding('utf8');

  //   child.stdout.on('data', function (data) {
  //       stdout += data;
  //       gutil.log(data);
  //   });

  //   child.stderr.setEncoding('utf8');
  //   child.stderr.on('data', function (data) {
  //       stderr += data;
  //       gutil.log(gutil.colors.red(data));
  //       gutil.beep();
  //   });

  //   child.on('close', function(code) {
  //       gutil.log("Done with exit code", code);
  //       gutil.log("You access complete stdout and stderr from here"); // stdout, stderr
  //   });
  // })

})();
