'use strict'

const { src, dest, parallel, series, watch } = require('gulp') // Определяем константы Gulp
const htmlmin = require('gulp-htmlmin')
const concat = require('gulp-concat') // Подключаем gulp-concat
const uglify = require('gulp-uglify-es').default // Подключаем gulp-uglify-es
const sass = require('gulp-sass')(require('sass')) // Подключаем модуль gulp-sass
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const cleanCss = require('gulp-clean-css')
const notify = require('gulp-notify')
const autoprefixer = require('gulp-autoprefixer') // Подключаем Autoprefixer
const newer = require('gulp-newer')
const imagemin = require('gulp-imagemin') // Подключаем gulp-imagemin для работы с изображениями
const del = require('del') // Подключаем модуль del
// const browserSync = require('browser-sync').create(); // Подключаем Browsersync
// const ftp = require('vinyl-ftp'); // Подключаем модуль для FTP

/* Paths */
const srcPath = 'src/'
const buildPath = 'assets/'

const path = {
  build: {
    all: buildPath,
    js: buildPath + 'js/',
    css: buildPath + 'css/',
    images: buildPath + 'img/',
    fonts: buildPath + 'fonts/',
  },
  src: {
    all: srcPath + '**/*',
    html: srcPath + '**/*.html',
    js: srcPath + 'js/*.js',
    css: srcPath + 'scss/*.scss',
    images: srcPath + 'img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}',
    fonts: srcPath + 'fonts/**/*.{eot,woff,woff2,ttf,svg}',
  },
  watch: {
    all: srcPath + '**/*',
    html: srcPath + '**/*.html',
    js: srcPath + 'js/**/*.js',
    css: srcPath + 'scss/**/*.scss',
    images: srcPath + 'img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}',
    fonts: srcPath + 'fonts/**/*.{eot,woff,woff2,ttf,svg}',
  },
  clean: './' + buildPath,
}

// const conn = ftp.create( {
// 	host:     '185.114.245.193', // Имя хоста(сервера) или IP
// 	user:     'cg27438', // login пользователя
// 	password: 'gScgRWURwj28', // пароль пользователя
// } );

// function deploy() {
//   // using base = '.' will transfer everything to /public_html correctly
//   // turn off buffering in gulp.src for best performance

//   return (
//     src('./' + path.src.all, { base: './' + path.build.all, buffer: false })
//       // .pipe(newer(buildPath))
//       .pipe(dest(buildPath))
//       .pipe(notify('Files have been send'))
//   ) // Уведомление об удачной закачке
// }

function styles() {
  return src(path.src.css, { base: srcPath + 'scss/' }) // Выбираем источник
    .pipe(
      plumber({
        errorHandler: function (err) {
          notify.onError({
            title: 'SCSS Error',
            message: 'Error: <%= error.message %>',
          })(err)
          this.emit('end')
        },
      }),
    )
    .pipe(
      sass({
        includePaths: './node_modules/',
        grid: true,
      }),
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 3 versions'],
        cascade: false,
      }),
    )
    .pipe(
      cleanCss({
        format: 'minify', // minify/beautify
        level: {
          1: {
            specialComments: 0,
          },
          2: {
            mergeSemantically: false, // контролирует семантическое слияние; по умолчанию false
          },
        },
      }),
    )
    .pipe(
      rename({
        suffix: '.min',
        extname: '.css',
      }),
    )
    .pipe(dest('./' + path.build.css))
  // .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function scripts() {
  return (
    src([
      // 'node_modules/aos/dist/aos.js',
      // 'node_modules/@fancyapps/ui/dist/fancybox.umd.js',
      // 'node_modules/swiper/swiper-bundle.min.js',
      path.src.js,
    ])
      .pipe(
        plumber({
          errorHandler: function (err) {
            notify.onError({
              title: 'JS Error',
              message: 'Error: <%= error.message %>',
            })(err)
            this.emit('end')
          },
        }),
      )
      .pipe(concat('main.js')) // Конкатенируем в один файл
      //.pipe(dest(path.build.js)) // Выгружаем готовый файл в папку назначения
      .pipe(uglify()) // Сжимаем JavaScript
      .pipe(
        rename({
          suffix: '.min',
          extname: '.js',
        }),
      )
      .pipe(dest('./' + path.build.js))
  ) // Выгружаем готовый файл в папку назначения
  //.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function images() {
  return src(path.src.images) // Берём все изображения из папки источника
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 95, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(dest(path.build.images))
  // .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts))
  // .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function clean() {
  return del([
    './' + path.build.css + 'style.min.css',
    './' + path.build.js + 'main.min.js',
    './' + path.build.images,
  ])
}

function watchFiles() {
  // watch([path.build.all], deploy) // отслеживание, если файл изменяется, то происходит закачка
  watch([path.watch.css], styles) // отслеживание, если файл изменяется, то происходит закачка
  watch([path.watch.js], scripts) // отслеживание, если файл изменяется, то происходит закачка
  watch([path.watch.fonts], fonts) // отслеживание, если файл изменяется, то происходит закачка
  watch([path.watch.images], images) // отслеживание, если файл изменяется, то происходит закачка
}

const build = series(clean, parallel(watchFiles, styles, scripts, images, fonts))

exports.build = build
exports.styles = styles // Экспортируем функцию styles() в таск styles
exports.scripts = scripts // Экспортируем функцию scripts() в таск scripts
exports.images = images // Экспортируем функцию images() в таск images
exports.fonts = fonts // Экспортируем функцию fonts() в таск fonts
exports.clean = clean // Экспортируем функцию clean() как таск clean

/* 
 Все что ниже нужно для усовершенствования функционала галп сборки
*/

// Определяем логику работы Browsersync
// function browsersync() {
// 	browserSync.init({ // Инициализация Browsersync
// 		server: {
// 			baseDir: "./" + distPath
// 		}, // Указываем папку сервера
// 		notify: true, //  Включаем уведомления
// 		online: true // Режим работы: true или false
// 	})
// }

// function fonts() {
//     return src(path.src.fonts)
//         .pipe(dest(path.build.fonts))
// 		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
// }

// function clean() {
//     return del(path.clean);
// }

// function watchFiles() {
//     watch([path.watch.html], html);
//     watch([path.watch.css], styles);
//     watch([path.watch.js], scripts);
// 	   watch([path.watch.images], images);
//     watch([path.watch.fonts], fonts);
// }

// const build = series(clean, parallel(html, styles, scripts, images, fonts));
// const Watch = series(build,  parallel(watchFiles, browsersync));

// const build = series(ftpConn);

// exports.browsersync = browsersync; // Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
// exports.scripts = scripts; // Экспортируем функцию scripts() в таск scripts
// exports.styles = styles; // Экспортируем функцию styles() в таск styles
// exports.images = images; // Экспорт функции images() в таск images
// exports.fonts = fonts; // Экспорт функции fonts() в таск fonts
// exports.clean = clean; // Экспортируем функцию clean() как таск clean
// exports.build = build;
// exports.default = Watch;

//exports.build = series(clean, parallel(html, styles, scripts, images, fonts)); // Создаём новый таск "build", который последовательно выполняет нужные операции
//exports.default = parallel(build, styles, scripts, browsersync, watchFiles); // Экспортируем дефолтный таск с нужным набором функций
