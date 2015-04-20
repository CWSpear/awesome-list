var gulp            = require('gulp');
var gutil           = require('gulp-util');
var ngAnnotate      = require('gulp-ng-annotate');
var babel           = require('gulp-babel');
var uglify          = require('gulp-uglify');
var concat          = require('gulp-concat');
var rename          = require('gulp-rename');
var angularFilesort = require('gulp-angular-filesort');
var plumber         = require('gulp-plumber');
var karma           = require('karma').server;

gulp.task('default', buildTask);
gulp.task('build', buildTask);
gulp.task('watch', ['build'], watchTask);
gulp.task('test', ['build'], testTask)

function buildTask() {
    return gulp.src('src/*.js')
        .pipe(plumber(plumberError))
        .pipe(concat('awesome-list.js'))
        .pipe(babel())
        .pipe(angularFilesort())
        .pipe(ngAnnotate())
        .pipe(gulp.dest('dist/'))
        .pipe(uglify())
        .pipe(rename('awesome-list.min.js'))
        .pipe(gulp.dest('dist'));
}

function watchTask() {
    gulp.watch('src/*.js', ['build']);
}

function testTask(done) {
    var args = require('yargs').argv;

    var opts = {
        configFile:  __dirname + '/karma.conf.js'
    };

    if (args.once) {
        opts.singleRun = true;
        opts.autoWatch = true;
    };

    karma.start(opts);

    // karma watches dist files to re-run
    gulp.watch('src/*.js', ['build']);
}

function plumberError(err) {
    gutil.beep();
    console.error(err.message, err);
}
