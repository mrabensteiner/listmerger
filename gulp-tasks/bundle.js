const {src, dest, pipe } = require('gulp');
const rename = require('gulp-rename');
const path = require("path");
const rollup = require("rollup");
const rollupCommonJs = require("@rollup/plugin-commonjs");
const rollupTypeScript = require("@rollup/plugin-typescript");
const { default: rollupNodeResolve } = require("@rollup/plugin-node-resolve");
const terser = require("@rollup/plugin-terser");
const fs = require("fs");
const zlib = require("zlib");
const csso = require('gulp-csso');

function gzipFile(file) {
  const source = fs.readFileSync(file);
  fs.writeFileSync(`${file}.gz`, zlib.gzipSync(source));
}

function bundleCss() {
  src("dist/library/listmerger.css").pipe(csso()).pipe(rename('listmerger.min.css')).pipe(dest("./dist/library/"));
  gzipFile("dist/library/listmerger.css");
}

async function bundle() {
  const build = await rollup.rollup({
    input: path.resolve(process.cwd(), "src/lib/index.ts"),
    plugins: [
      rollupNodeResolve({ browser: true }),
      rollupCommonJs(),
      rollupTypeScript({
        tsconfig: path.resolve(process.cwd(), "tsconfig.json"),
        compilerOptions: {
          declaration: false,
          declarationDir: undefined,
        },
      }),
    ],
  });

  const minPlugins = [terser()];

  async function writeLib(format) {
    const location = path.resolve(process.cwd(), `dist/library/${format}`);
    const formatString =
      format === "iife"
        ? "IIFE"
        : format === "esm"
          ? "ESM"
          : format === "cjs"
            ? "CommonJS"
            : "";
    const config = [
      { extension: "js", plugins: [], sourcemap: true, gzip: true },
      { extension: "min.js", plugins: minPlugins, sourcemap: false, gzip: true },
    ];

    for (const conf of config) {
      const file = path.join(location, `listmerger.${conf.extension}`);

      await build.write({
        file,
        format: format === "esm" ? "es" : format,
        name: "listmerger",
        plugins: conf.plugins,
        sourcemap: conf.sourcemap,
        banner: `// ListMerger v0.1 ${formatString}`,
      });

      if (!fs.existsSync(file)) {
        throw new Error(`Expected output file was not created: ${file}`);
      }

      if (conf.gzip) {
        gzipFile(file);
      }
    }
  }

  await writeLib("esm");
  await writeLib("iife");
  await writeLib("cjs");
  await build.close();
  
  bundleCss();
}

module.exports = { bundle };
