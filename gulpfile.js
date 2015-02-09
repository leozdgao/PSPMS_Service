var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

// set default task
gulp.task('default', ['develop']);

gulp.task('lint', function() {
	gulp.src('./**/*.js')
		.pipe(jshint());
});

gulp.task('develop', function() {
	nodemon({ script: 'app.js', ext: 'js' })
		// .on('change', ['lint'])
		.on('restart', function() {
			console.log('restarted!');
		});
});
