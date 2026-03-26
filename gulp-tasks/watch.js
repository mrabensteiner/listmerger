const {src, dest, watch, series } = require('gulp');
const bs = require("browser-sync").create();
const { bundle } = require("./bundle");

function copyExampleFolder() {
    return src('./src/example/**/*', {encoding: false}).pipe(dest('./dist/example'));
}

function copyLibFileToExample() {
    return src('./dist/library/esm/listmerger.js').pipe(dest('./dist/example/lib/'));
}

function reload(done) {
  bs.reload();
  done();
}

function watcher() {
  bs.init({
    server: "./dist/example",
    open: true,
    notify: false,
  });

  watch("src/lib/**/*.{ts,js}", series(bundle, copyLibFileToExample, reload));
  watch("src/example/**/*", series(copyExampleFolder, reload), {encoding: false});
}

module.exports = {watcher}
