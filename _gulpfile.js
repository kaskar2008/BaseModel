var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var connect = require('gulp-connect');
var open = require('gulp-open');

function compile(watch) {
  var bundler = watchify(browserify('./example/app.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./example/dist'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> Bundling...');
      rebundle();
      console.log('-> Done.');
    });
  }

  rebundle();
  gulp.start(['webserver']);
}

function watch() {
  return compile(true);
};

gulp.task('webserver', function() {
  var port = 8000;
  connect.server({
    root: './example/dist',
    port: port,
    fallback: './example/dist/index.html'
  });
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:'+port}));
});

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return watch(); });

gulp.task('default', ['watch']);
