"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _makerBase = _interopRequireDefault(require("@electron-forge/maker-base"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _fs_extra = _interopRequireDefault(require("fs-extra"));

var _makensis = _interopRequireDefault(require("makensis"));

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


class MakerNSIS extends _makerBase.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "name", 'nsis');

    _defineProperty(this, "defaultPlatforms", ['win32']);
  }

  isSupportedOnCurrentPlatform() {
    return true;
  }

  async make({
    dir,
    makeDir,
    appName,
    packageJSON,
    targetArch,
    targetPlatform
  }) {

    const originalTemplatePath = _path.default.resolve(__dirname, 'template.nsi');
    const templateTempPath = _path.default.resolve(dir, '_template.nsi');
    const exeName = this.config.name || `${appName}-${packageJSON.version}-SystemSetup.exe`
    const outputExePath = _path.default.resolve(makeDir, 'nsis', exeName);

    const nsisOptionsDefine = _objectSpread(this.config.nsisOptions.define, {
        MUI_PRODUCT: appName,
        MUI_FILE: outputExePath,
        MUI_VERSION: packageJSON.version,
        MUI_AUTHOR: packageJSON.author.name || packageJSON.author,
    });

    const nsisOptions = _objectSpread({
      // 'version-string': {
      //   'ProductName': appName,
      //   'FileDescription': packageJSON.description || appName,
      //   'CompanyName': author,
      //   'LegalCopyright': `Copyright © ${(new Date()).getFullYear()} ${author}`,
      //   'OriginalFilename': appName,
      //   'InternalName': appName,
      // },
      // 'file-version': packageJSON.version,
      // 'product-version': packageJSON.version,
    }, this.config.nsisOptions, {
      define: nsisOptionsDefine
    });

    await this.ensureFile(outputExePath);

    _fs.default.copyFileSync(originalTemplatePath, templateTempPath)

    let output = _makensis.compileSync(templateTempPath, nsisOptions)
    console.error(output.stderr)

    if(output.status !== 0) {
      console.log(output.stdout)
      throw "Error compiling NSIS!"
    }

    _fs.default.unlinkSync(templateTempPath)

    return [outputExePath];
  }


}

exports.default = MakerNSIS;
