// npm install --save-dev gulp browser-sync gulp-nodemon del run-sequence gulp-htmlmin gulp-rename gulp-imagemin gulp-sourcemaps gulp-babel babel-preset-env babel-core gulp-uglify gulp-sass gulp-autoprefixer gulp-clean-css

// settings
const nodePort = 3000;
const bsPort = 5000; // must be different from nodePort

const srcDir = 'src'; // path from ./ where you write code (src)
const destDir = 'public'; // final location from ./ where distribution files will go

const scriptOrder = ['src/scripts/**/*.js'];
const htmlOrder = ['src/views/**/*.html'];
const styleOrder = ['src/sass/main.sass'];
const vendorOrder = ['src/vendors/*.js'];

// dependencies
const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  babel = require('gulp-babel'),
  browserSync = require('browser-sync'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  del = require('del'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  nodemon = require('gulp-nodemon'),
  rename = require('gulp-rename'),
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify');

// tasks
gulp.task('browser-sync', ['nodemon'], ()=> {
  browserSync({
    proxy: `localhost:${nodePort}`,
    port: bsPort,
    notify: true
  });
});

gulp.task('build', (callback)=> {
  return runSequence('clean:build',
    ['vendors', 'scripts', 'html', 'styles', 'images', 'fonts'],
    callback);
});

gulp.task('clean:assets', ()=> {
  return del(`${destDir}/assets`);
});

gulp.task('clean:build', ()=>{
  return del(destDir);
});

gulp.task('fonts', ()=> {
  gulp.src(`${srcDir}/fonts/*`)
    .pipe(gulp.dest(`${destDir}/fonts`))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('html', ()=> {
  gulp.src(htmlOrder)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(`${destDir}/views`))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('images', ['clean:assets'], ()=> {
  gulp.src(`${srcDir}/assets/**/*+(png|jpg|jpeg|gif|svg)`)
    .pipe(imagemin())
    .pipe(gulp.dest(`${destDir}/assets`))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('nodemon', (cb)=> {
  var called = false;
  nodemon({
    script: 'server.js',
    ignore: [
      'gulpfile.js',
      'node_modules/'
    ]
  })
  .on('start', ()=> {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', ()=> {
    setTimeout(()=> {
      browserSync.reload();
    }, 1000);
  });
});

gulp.task('scripts', ()=> {
  gulp.src(scriptOrder)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destDir))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('styles', () => {
  gulp.src(styleOrder)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({
      compatibility: '*'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(`${destDir}/styles`))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('vendors', ()=> {
  gulp.src(`${srcDir}/vendors/*.js`)
    .pipe(concat('vendors.min.js'))
    .pipe(gulp.dest(`${destDir}`))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// watch
gulp.task('watch:fonts', ()=> {
  gulp.watch(`${srcDir}/fonts/*`, ['fonts']);
});

gulp.task('watch:html', ()=> {
  gulp.watch(`${srcDir}/views/**/*.html`, ['html']);
});

gulp.task('watch:images', ()=> {
  gulp.watch(`${srcDir}/assets/**/*`, ['images']);
});

gulp.task('watch:scripts', ()=> {
  gulp.watch(`${srcDir}/scripts/**/*.js`, ['scripts']);
});

gulp.task('watch:styles', ()=> {
  gulp.watch(`${srcDir}/sass/**/*.sass`, ['styles']);
});

gulp.task('watch:vendors', ()=> {
  gulp.watch(`${srcDir}/vendors/*.js`, ['vendors'])
});

// default
gulp.task('default', ['build', 'browser-sync'], (callback)=> {
  return runSequence(['watch:fonts', 'watch:html', 'watch:images', 'watch:scripts', 'watch:styles', 'watch:vendors'], callback);
});
