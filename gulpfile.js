const {src, dest, series, parallel, task} = require('gulp');
const del = require('del');
const {bundle} = require("./gulp-tasks/bundle");
const {watcher} = require("./gulp-tasks/watch");

function cleanDistFolder() {
    return del('dist', {force: true});
}

function cleanNodeModules() {
    return del('node_modules', {force: true});
}

function cleanPackageLock() {
    return del('yarn-lock.json', {force: true});
}

function cleanPackage() {
    return del('package', {force: true});
}

function copyExampleFolder() {
    return src('./src/example/**/*').pipe(dest('./dist/example'));
}

function copyLibFileToExample() {
    return src('./dist/library/esm/listmerger.js').pipe(dest('./dist/example/lib/'));
}

task('deploy', function () {
    return gulp.src("./dist/**/*").pipe(deploy())
});

exports.clean = cleanDistFolder;

exports.cleanAll = parallel(cleanDistFolder, cleanNodeModules, cleanPackageLock, cleanPackage);

exports.build = series(cleanDistFolder, copyExampleFolder, bundle, copyLibFileToExample);

exports.dev = series(exports.build, watcher);
