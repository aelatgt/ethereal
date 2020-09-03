// import {Resolver} from '@parcel/plugin';
const {Resolver} = require('@parcel/plugin')
// import NodeResolver from '@parcel/node-resolver-core';
const NodeResolver = require('@parcel/node-resolver-core').default

// Throw user friendly errors on special webpack loader syntax
// ex. `imports-loader?$=jquery!./example.js`
const WEBPACK_IMPORT_REGEX = /\S+-loader\S*!\S+/g;

exports.default = new Resolver({
  resolve({dependency, options, filePath}) {
    if (WEBPACK_IMPORT_REGEX.test(dependency.moduleSpecifier)) {
      throw new Error(
        `The import path: ${dependency.moduleSpecifier} is using webpack specific loader import syntax, which isn't supported by Parcel.`,
      );
    }

    const resolver = new NodeResolver({
      fs: options.inputFS,
      projectRoot: options.projectRoot,
      extensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'styl', 'vue'],
      mainFields: ['source', 'browser', 'module', 'main'],
      options
    });
    return resolver.resolve({
      filename: filePath,
      isURL: dependency.isURL,
      parent: dependency.sourcePath,
      env: dependency.env,
    });
  },
});

exports.__esModule = true