var gulp            = require('gulp');
var ngAnnotate      = require('gulp-ng-annotate');
var babel           = require('gulp-babel');
var uglify          = require('gulp-uglify');
var concat          = require('gulp-concat');
var rename          = require('gulp-rename');
var angularFilesort = require('gulp-angular-filesort');
var plumber         = require('gulp-plumber');

gulp.task('build', buildTask);

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

function plumberError(err) {
    gutil.beep();
    console.error(err.message, err);
}
