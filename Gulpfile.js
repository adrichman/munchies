(function(){

  'use strict';

  var gulp = require('gulp');
  var mocha = require('gulp-mocha');
  var uglify = require('gulp-uglify');
  var concat = require('gulp-concat');
  var less = require('gulp-less');
  var jshint  = require('gulp-jshint');
  var notify = require('gulp-notify');
  var spawn = require('child_process').spawn;
  var path = require('path');

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
      './public/stylesheets/*.less',
      './test/*.js',
      './test/**/*.js'
    ]
  };

  gulp.task('lint', function(){
    return gulp.src(['./*.js'])
      .pipe(jshint())
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
      .pipe(gulp.dest('./public/javascripts/munchies-map'));
  });

  gulp.task('uglify', function(){
    gulp.src('./public/javascripts/munchies-map/app.js')
      .pipe(uglify())
      .pipe(gulp.dest('./public/javascripts/dist/'));
  });

  gulp.task('test', function() {
    return gulp.src(['./test/*.js', './test/**/*.js'], {read : false})
        .pipe(mocha({ reporter: 'spec', ui : 'bdd' }));
  });

  gulp.task('watch-tests',function(){
    gulp.watch(['./test/**'], ['test']); 
  });

  // gulp.task('debug-tests', function(){
  //   spawn('node', [ 
  //     '--debug-brk', 
  //     path.join(__dirname, 'node_modules/gulp/bin/gulp.js'),
  //     'watch-tests'
  //   ], { stdio: 'inherit' });
  // })

  gulp.task('default', [
    'less',
    'lint',
    'javascript', 
    'uglify',
    'test'
  ], function(){ 
      gulp.watch(paths.Munchies, ['test','default']); 
  });

})();
