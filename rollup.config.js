import path from 'path';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import fse from 'fs-extra';

let activeOutputDir = 'build';

if (process.env.LOCAL_DEV_OUTPUT_DIRECTORY) {
  let appDir = path.join(process.cwd(), process.env.LOCAL_DEV_OUTPUT_DIRECTORY);
  try {
    fse.readdirSync(path.join(appDir, 'node_modules'));
  } catch (e) {
    console.error(
      'Oops! You pointed LOCAL_DEV_OUTPUT_DIRECTORY to a directory that ' +
        'does not have a node_modules/ folder. Please `npm install` in that ' +
        'directory and try again.'
    );
    process.exit(1);
  }
  console.log('Writing rollup output to', appDir);
  activeOutputDir = appDir;
}

function getOutputDir(pkg) {
  return path.join(activeOutputDir, 'node_modules/@supabase', pkg);
}

function createBanner(packageName, version) {
  return `/**
 * ${packageName} v${version}
 *
 * Copyright (c) Supabase
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @license MIT
 */`;
}

function getVersion(packageDir) {
  return require(`./${packageDir}/package.json`).version;
}

/** @returns {import("rollup").RollupOptions[]} */
function createRollupOptions(packageName) {
  let sourceDir = `packages/${packageName}`;
  let outputDir = getOutputDir(packageName);
  let version = getVersion(sourceDir);

  return [
    {
      external() {
        return true;
      },
      input: `${sourceDir}/index.ts`,
      output: {
        format: 'cjs',
        dir: outputDir,
        banner: createBanner(packageName, version),
        preserveModules: true,
        exports: 'auto'
      },
      plugins: [
        babel({
          babelHelpers: 'bundled',
          exclude: /node_modules/,
          extensions: ['.ts', '.tsx']
        }),
        nodeResolve({ extensions: ['.ts', '.tsx'] }),
        copy({
          targets: [
            { src: `LICENSE`, dest: outputDir },
            { src: `${sourceDir}/package.json`, dest: outputDir },
            { src: `${sourceDir}/README.md`, dest: outputDir }
          ]
        })
      ]
    },
    {
      external() {
        return true;
      },
      input: `${sourceDir}/index.ts`,
      output: {
        banner: createBanner(packageName, version),
        dir: `${outputDir}/esm`,
        format: 'esm',
        preserveModules: true
      },
      plugins: [
        babel({
          babelHelpers: 'bundled',
          exclude: /node_modules/,
          extensions: ['.ts', '.tsx']
        }),
        nodeResolve({ extensions: ['.ts', '.tsx'] })
      ]
    }
  ];
}

export default function rollup(options) {
  let builds = [
    ...createRollupOptions('auth-helpers-react'),
    ...createRollupOptions('auth-helpers-nextjs')
  ];

  return builds;
}
