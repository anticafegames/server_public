const gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
 
gulp.task("default", function () {
    tsProject.src()
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest("dist"))

    return gulp.src('src/crypt/*.*')                               
	    .pipe(gulp.dest('dist/crypt'));
})