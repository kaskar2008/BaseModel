import gulp                 from 'gulp'
import source               from 'vinyl-source-stream'
import buffer               from 'vinyl-buffer'
import browserify           from 'browserify'
import watchify             from 'watchify'
import babel                from 'babelify'
import uglify               from 'gulp-uglify'
import connect              from 'gulp-connect'
import open                 from 'gulp-open'
import util                 from 'gulp-util'
import rename               from 'gulp-rename'

const paths = {
  scripts: {
    src: 'example/app.js',
    dest: 'example/dist/',
    dest_name: 'app.js'
  },
  dist: {
    path: './example/dist',
    entry: './example/dist/index.html'
  }
}

gulp.task('browserify_task', () => {
  util.log('Building...')

  var bundler = browserify(paths.scripts.src, { debug: true })

  bundler.transform(babel)

  var result = bundler.bundle()
    .on('error', (err) => { util.log(err); this.emit('end'); })
    .pipe(source(paths.scripts.dest_name))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest))

  util.log('Building complete')

  return result
})

gulp.task('watchify_task', () => {
  var bundler = watchify(browserify(paths.scripts.src, { debug: true }))

  bundler.transform(babel)

  bundler.on('update', rebundle)

  function rebundle() {
    util.log('Rebuilding js...')
    var result = bundler.bundle()
      .on('error', (err) => { util.log(err); this.emit('end'); })
      .pipe(source(paths.scripts.dest_name))
      .pipe(gulp.dest(paths.scripts.dest))
    util.log('Rebuilding js complete')
    return result
  }

  return rebundle()
})

gulp.task('webserver_task', () => {
  var port = 8000
  connect.server({
    root: paths.dist.path,
    port: port,
    fallback: paths.dist.entry
  })
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:'+port}))
})

const build = gulp.series('browserify_task')
const dev = gulp.series('watchify_task', gulp.parallel('webserver_task'))

export { build }
export default dev
