var gulp = require('gulp');
var gutil = require('gulp-util');
var child_process = require('child_process');
var process = require('process');

function make (target, cb) {
    var cl = ('node make.js ' + target + ' ' + process.argv.slice(3).join(' ')).trim();
    console.log('------------------------------------------------------------');
    console.log('> ' + cl);
    console.log('------------------------------------------------------------');
    try {
        child_process.execSync(cl, { cwd: __dirname, stdio: 'inherit' });
    }
    catch (err) {
        var msg = err.output ? err.output.toString() : err.message;
        console.error(msg);
        cb(new gutil.PluginError(msg));
        return false;
    }

    return true;
}

gulp.task('build', function (cb) {
    make('build', cb);
});

gulp.task('default', ['build']);

gulp.task('clean', function (cb) {
    make('clean', cb);
});

gulp.task('test', function (cb) {
    make('build', cb) &&
    make('test', cb);
});

gulp.task('updateversioninfo', function(cb) {
    make('updateversioninfo', cb);
});

gulp.task('package', function (cb) {
    make('clean', cb) &&
    make('updateversioninfo', cb) &&
    make('build', cb) &&
    make('test', cb) &&
    make('package', cb);
});
