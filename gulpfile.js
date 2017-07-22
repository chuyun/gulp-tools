/**
 * Created by jun on 2017/7/11.
 */

/**
 * @author  i@juncao.cc
 * @description 自动化流程工具
 *              @开发环境：使用 gulp dev-less 或者 gulp dev-sass  ==> 搭建本地服务器[监测文件变化,自动编译,压缩,刷新页面,搭建本地服务器]
 *              @生产环境：(1) 使用 gulp less ==> 编译Less文件     gulp sass ==> 编译sass文件
 *                        (2) 使用 gulp minify-css ==> 压缩css文件到 dist 目录下
 *                       （3）使用 gulp product-less 或 gulp product-sass 结合以上两个步骤
 * @param [...]
 * @return [...]
 */

var gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    autoprefixer = require('gulp-autoprefixer'),
    compass = require('gulp-compass'),
    gutil = require('gulp-util'),
    notify = require("gulp-notify"),
    plumber = require('gulp-plumber'),
    cleanCSS = require('gulp-clean-css'),
    spriter = require('gulp-css-spriter'),
    spriter_param = require('gulp-css-spriter-param');


/**
 * @description  容错处理函数
 * */
function errHandler(e) {
    gutil.log(e.toString());
}

/**
 * @description  browserSync 实时刷新
 * @notice 启动于根目录
 * */
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: './'
        }
    })
});

/**
 * @description 文件监控 监控文件变化后执行对应的操作
 * @notice
 * */
gulp.task('watch', function () {
    gulp.watch('**/*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
    gulp.watch('less/**/*.less', ['less','minify-css']);
    gulp.watch('sass/**/*.scss', ['compass','minify-css']);
    gulp.watch('stylesheets/*.css', browserSync.reload);
});

/**
 * @description  less编译 包含 autoprefixer 可自行修改
 * @notice
 * */
gulp.task('less', function () {
    return gulp.src('./less/*.less')
        .pipe(plumber({
            errorHandler: function (error) {
                this.emit('end')
            }
        }))
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(autoprefixer({
            browsers: ['>1%'],
            cascade: true, //是否美化属性值 默认：true
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('./css'))
});


/**
 * @description  使用 compass 编译 sass/scss 文件
 * @notice (1)使用前请确保安装了compass  ==>   gem update --system
 *                                          gem install compass
 * */
gulp.task('compass', function () {
    gulp.src('./sass/*.scss')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(compass({
            css: 'stylesheets',
            sass: 'sass',
            image: 'images'
        }))
        .on('error', function (err) {
            console.log(err);
            this.emit('end');
            notify(err.description);
        })
        // .pipe(minify-css())
        // .pipe(gulp.dest('dist'));
});

/**
 * @description css压缩工具
 */
gulp.task('minify-css', function () {
    return gulp.src('./stylesheets/*.css')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }, function (details) {
            gutil.log(details.name + ': 压缩前大小 ==> ' + details.stats.originalSize);
            gutil.log(details.name + ': 压缩后大小 ==> ' + details.stats.minifiedSize);
            gutil.log(details.name + ': 压缩效率 ==> ' + details.stats.efficiency)
        }))
        .pipe(gulp.dest('dist'))
        .pipe(notify("压缩完成"))
});

/**
 * @description sprite工具-按需生成
 */
gulp.task('spriter_param', function () {
    var timestamp = +new Date(); // timestamp 可选  sprite文件命名随意
    return gulp.src('./css/xxx.css') //xxx.css是你的css文件，在图片url后增加特定参数(?__sprite)才去处理雪碧图
        .pipe(spriter_param({
            // 生成的sprite图片存放地址
            'spriteSheet': './dist/sprite_' + timestamp + '.png',
            // Because we don't know where you will end up saving the CSS file at this point in the pipe,
            // we need a litle help identifying where it will be.
            'pathToSpriteSheetFromCSS': './sprite_' + timestamp + '.png' //这是在css引用的图片路径，很重要
        }))
        .pipe(gulp.dest('./dist')); //最后生成出来
});
/**
 * @description sprite工具-将css中引用的所有图片合成雪碧图 --> 不推荐使用
 */
gulp.task('spriter', function () {
    var timestamp = +new Date();
    return gulp.src('./css/xxx.css')
        .pipe(spriter({
            'spriteSheet': './dist/sprite_' + timestamp + '.png',
            'pathToSpriteSheetFromCSS': './sprite_' + timestamp + '.png'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('auto', function () {
    // 监听文件修改，当文件被修改则执行 less 任务
    gulp.watch('./less/**.less', ['less'])
});
gulp.task('default', ['less', 'auto']);


/**
 * @description 开发环境 包含less编译 、sass编译、css压缩
 */
gulp.task('dev-less', function (callback) {
    runSequence(['browserSync', 'watch'], callback)
});
gulp.task('dev-sass', function (callback) {

    runSequence(['browserSync', 'watch'], callback)
});


/**
 * @description 生产环境 包含less编译、sass编译 、css压缩 (区分less项目和sass项目)
 */
gulp.task('product-less', function (callback) {
    runSequence(['less', 'minify-css'], callback)
});

gulp.task('product-sass', function (callback) {
    runSequence(['compass', 'minify-css'], callback)
});