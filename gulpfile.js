'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const include = require('gulp-include');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const purify = require('gulp-purifycss');
// const concat = require('gulp-concat');

// 동적 import로 gulp-prettier 로드
async function loadPrettier() {
    const { default: prettier } = await import('gulp-prettier');
    return prettier;
}

// 경로 정의
// 경로 정의
const src = 'src';
const app = 'static/campaign/2025/ypfi';
const domain = 'https://younsang344.cafe24.com';

const paths = {
    html: {
        src: `${src}/**/*.html`,
        dest: `${app}/`,
    },
    scss: {
        src: [`${src}/scss/*.scss`, `${src}/scss/**/*.scss`],
        dest: `${app}/css`,
    },
    libCss: {
        src: `${src}/scss/lib/*.css`,
        dest: `${app}/css`,
    },
    js: {
        src: `${src}/js/*.js`,
        dest: `${app}/js`,
    },
    libJs: {
        src: `${src}/js/lib/*.js`,
        dest: `${app}/js`,
    },
    img: {
        src: `${src}/images/**`,
        dest: `${app}/images`,
    },
    font: {
        src: `${src}/fonts/**`,
        dest: `${app}/fonts`,
    },
};

// HTML 처리
function html() {
    return gulp
        .src([paths.html.src, `!${src}/include/**/*.html`])
        .pipe(include())
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browserSync.stream());
}

// SCSS 처리
async function scss() {
    const prettier = await loadPrettier();

    // 라이브러리 CSS 먼저 처리
    gulp.src(paths.libCss.src)
        .pipe(gulp.dest(paths.libCss.dest))
        .pipe(browserSync.stream());

    // 메인 SCSS 처리
    return gulp
        .src(paths.scss.src)
        .pipe(
            sass({
                outputStyle: 'expanded',
                indentType: 'tab',
                indentWidth: 1,
            }).on('error', sass.logError),
        )
        .pipe(autoprefixer('last 16 version'))
        .pipe(purify([`${app}/**/*.js`, `${app}/*.html`]))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())
        .pipe(
            prettier({
                configFile: './prettier.config.js',
                ignorePath: '.gitignore',
            }),
        )
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream());
}

// JavaScript 처리
async function js() {
    const prettier = await loadPrettier();

    return Promise.all([
        // 라이브러리 JS 처리
        gulp.src(paths.libJs.src)
            .pipe(gulp.dest(paths.libJs.dest))
            .pipe(browserSync.stream()),

        // 메인 JS 처리
        gulp.src(paths.js.src)
            .pipe(gulp.dest(paths.js.dest))
            .pipe(browserSync.stream())
    ]);
}

// 정적 파일 처리
function staticFiles() {
    gulp.src(paths.font.src)
        .pipe(gulp.dest(paths.font.dest))
        .pipe(browserSync.stream());

    return gulp
        .src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest))
        .pipe(browserSync.stream())
        .on('error', err => console.error(err));
}

// 기본 작업 설정
const defaultTasks = gulp.parallel(html, scss, js, staticFiles);

// 빌드 및 버 실행
function run() {
    browserSync.init({
        port: 8080,
        server: {
            baseDir: `./${app}`,
            routes: {
                '/static': './static'
            }
        },
        // 프록시 설정 추가
        middleware: [
            function (req, res, next) {
                // 외부 리소스 요청 시 도메인 추가
                if (req.url.startsWith('/static')) {
                    req.url = domain + req.url;
                }
                next();
            }
        ],
        // 외부 리소스 허용
        cors: true,
        serveStatic: [{
            route: '/static',
            dir: './static'
        }]
    });

    // watch 경로 수정
    gulp.watch([
        `${src}/scss/**/*.scss`,
        `${src}/scss/*.scss`
    ], scss);  // browserSync.reload 제거

    gulp.watch(paths.html.src, html);
    gulp.watch(paths.js.src, js);
    gulp.watch(paths.img.src, staticFiles);
}

exports.html = html;
exports.scss = scss;
exports.js = js;
exports.staticFiles = staticFiles;

exports.default = defaultTasks;
exports.run = gulp.series(defaultTasks, run);
