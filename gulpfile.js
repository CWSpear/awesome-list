const gulp            = require('gulp');

gulp.task('default', buildTask);
gulp.task('build', buildTask);
gulp.task('watch', ['build'], watchTask);
gulp.task('test', ['build'], testTask);

const gutil           = require('gulp-util');
const ngAnnotate      = require('gulp-ng-annotate');
const babel           = require('gulp-babel');
const uglify          = require('gulp-uglify');
const concat          = require('gulp-concat');
const rename          = require('gulp-rename');
const angularFilesort = require('gulp-angular-filesort');
const plumber         = require('gulp-plumber');
const karma           = require('karma').server;

function buildTask() {
    return gulp.src('src/*.js')
        .pipe(plumber(plumberError))
        .pipe(concat('awesome-list.js'))
        .pipe(babel({
            presets: ['es2015'],
        }))
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
    const args = require('yargs').argv;

    const opts = {
        configFile:  __dirname + '/karma.conf.js',
    };

    if (args.once) {
        opts.singleRun = true;
        opts.autoWatch = true;
    }

    karma.start(opts);

    // karma watches dist files to re-run
    gulp.watch('src/*.js', ['build']);
}

function plumberError(err) {
    gutil.beep();
    console.error(err.message, err);
}
