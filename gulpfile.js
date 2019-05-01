var gulp = require('gulp');
var child_process = require('child_process');
var process = require('process');

function make (target, done) {
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
        done(new Error(msg));
        return false;
    }

    return true;
}

gulp.task('build', gulp.series(function (done) {
    make('build', done);
	done();
}));

gulp.task('default', gulp.series('build'));

gulp.task('clean', function (done) {
    make('clean', done);
	done();
});

gulp.task('test', function (done) {
    make('build', done) &&
    make('test', done);
	done();
});

gulp.task('updateversioninfo', function(done) {
    make('updateversioninfo', done);
	done();
});

gulp.task('updateregioninfo', function(done) {
    make('updateregioninfo', done);
	done();
});

gulp.task('package', function (done) {
    make('clean', done) &&
    make('build', done) &&
    make('test', done) &&
    make('package', done);
	done();
});

gulp.task('publish', function (done) {
    make('publish', done);
	done();
})
