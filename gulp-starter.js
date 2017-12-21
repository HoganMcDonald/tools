/*
npm install gulp gulp-autoprefixer gulp-clean-css gulp-rename gulp-htmlmin browser-sync run-sequence gulp-sass del gulp-imagemin gulp-concat npm install gulp-sourcemaps gulp-babel babel-preset-env babel-core --save-dev
*/

// dependencies
const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del'),
  rename = require('gulp-rename'),
  htmlmin = require('gulp-htmlmin'),
  browserSync = require('browser-sync').create(),
  runSequence = require('run-sequence'),
  imagemin = require('gulp-imagemin'),
  concat = require('gulp-concat'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass');

/*
compiles, minifies, autoprefixes, renames sass.
also will pump to browsersync
*/
gulp.task('styles', () => {
  console.log('styles ran');
  gulp.src('./src/sass/main.sass')
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
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

/*
minifies, renames html.
also will pump to browsersync
*/
gulp.task('html', ()=> {
  console.log('html ran');
  gulp.src(['./src/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scripts', ()=> {
  return gulp.src(['src/scripts/vendors/*.js', 'src/scripts/main.js', 'src/scripts/modules/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(concat('bundle.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.reload({
      stream: true
    }));
})

/*
compresses images.
also will pump to browsersync
*/
gulp.task('images', ()=> {
  gulp.src('src/assets/**/*+(png|jpg|jpeg|gif|svg)')
    .pipe(imagemin())
    .pipe(gulp.dest('public/assets'));
});

gulp.task('clean-assets', ()=>{
  return del(['public/assets']);
});

gulp.task('clean-public', ()=>{
  return del(['public']);
});

gulp.task('build', (callback)=>{
  return runSequence('clean-public',
              ['html', 'styles', 'scripts', 'images'],
              callback)
});

gulp.task('browserSync', ()=> {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    startPath: "./src/index.html"
  });
  gulp.watch('./src/sass/*.sass', ['styles']);
  gulp.watch('./src/index.html').on('change', browserSync.reload);
  gulp.watch('./src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/assets/**/*', ['images']).on('change', browserSync.reload);
});

gulp.task('default', ['build', 'browserSync']);
