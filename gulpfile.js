var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
	gulp.src('./**/*.js')
		.pipe(jshint());
});

gulp.task('develop', function() {
	nodemon({ script: 'app.js', ext: 'js' })
		.on('change', ['lint'])
		.on('restart', function() {
			console.log('restarted!');
		});
});
