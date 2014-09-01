(function(){

  'use strict';

  var gulp = require('gulp');
  var mocha = require('gulp-mocha');
  var gutil = require('gulp-util');
  var uglify = require('gulp-uglify');
  var less = require('gulp-less');
  var path = require('path');
  var sourcemaps = require('gulp-sourcemaps');
  var jshint  = require('gulp-jshint');
  var notify = require('gulp-notify');
  var spawn = require('child_process').spawn;

  var paths = {
    munchr: [
      './*',
      './public/javascripts/*.js',
      './public/stylesheets/*.less',
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

  gulp.task('less', function () {
    return gulp.src('./public/stylesheets/*.less')
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest('./public/stylesheets'));
  });

  // gulp.task('compress', function() {
  //   gulp.src('lib/*.js')
  //     .pipe(uglify())
  //     .pipe(gulp.dest('dist'))
  // });

  gulp.task('mocha', function() {
      return gulp.src(['test/*.js'], { read: false })
          .pipe(mocha({ reporter: 'list' }))
          .on('error', gutil.log);
  });

  gulp.task('watch-mocha', function() {
      gulp.watch(['lib/**', 'test/**'], ['mocha']);
  });

  gulp.task('watch', function(){
    gulp.watch(paths.munchr, ['less','mocha'])
  });
  
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
