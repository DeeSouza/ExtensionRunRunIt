var gulp   			= require('gulp');
var gulpsass		= require('gulp-sass');
var gulpif 			= require('gulp-if');
var autoprefixer 	= require('gulp-autoprefixer');

gulp.task('sass', function(){
	return gulp.src('assets/sass/**/*')
	.pipe(gulpif(function(file){ return file.path.indexOf('.scss') != -1; }, gulpsass()))
	.pipe(gulp.dest('css/'));
});

gulp.task("default", function(){
	gulp.watch("assets/**/*.scss", ['sass', 'run-prefixer']);
});

gulp.task('run-prefixer', ['sass'], function() {
	return gulp.src('css/*.css')
	.pipe(autoprefixer({
		browsers: ['last 4 versions', '> 10%', 'ie 9'],
		cascade: true
	}))
	.pipe(gulp.dest('css/'));
});