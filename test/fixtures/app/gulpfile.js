var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var join = require('path').join;
var paths = {
  public: './public/assets',
  assets: './app/assets'
};
var log = {
  error: console.error.bind(console, 'assets:'),
  info: console.info.bind(console, 'assets:')
};

paths.js = {
  src: join(paths.assets, 'js'),
  dest: join(paths.public, 'js')
};
paths.styles = {
  src: join(paths.assets, 'stylesheets'),
  dest: join(paths.public, 'stylesheets')
};

function compile(watch) {
  var watcher;

  watcher = watchify(
    browserify(join(paths.js.src, 'app.js'), {
      debug: true,
      cache: {},
      packageCache: {}
    })
  )
  .on('log', log.info.bind('Bundle:'));

  function rebundle() {
    watcher
      .bundle()
      .on('error', function(err) { log.error(err); this.emit('end'); })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.js.dest));
  }

  if (watch) watcher.on('update', rebundle);

  rebundle();
}

gulp.task('styles', function() {
  gulp.src([
      join(paths.styles.src, '**.scss'),
      '!' + join(paths.styles.src, '**', '!_*.scss') // ignore partials
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('build', function() { return compile(); });

gulp.task('watch', function() {
  gulp.watch(join(paths.styles.src, '**', '*.scss'), ['styles']);
  return compile(true);
});

gulp.task('default', ['watch']);