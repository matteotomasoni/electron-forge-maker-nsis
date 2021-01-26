"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _makerBase = _interopRequireDefault(require("@electron-forge/maker-base"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

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
    const templateTempPath = _path.default.resolve(makeDir, '_template.nsi');
    const exeName = `${appName}-${packageJSON.version}-Setup.exe`
    const exeDir = _path.default.resolve(dir)
    const outputExePath = _path.default.resolve(makeDir, exeName);
    const author = typeof packageJSON.author == 'object' ? packageJSON.author.name : packageJSON.author
    const version = packageJSON.version

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
    });

    await this.ensureFile(outputExePath);

    let template = _fs.default.readFileSync(originalTemplatePath, {encoding: 'utf8'})

    // replace all
    let replaces = [
      ["%%NAME%%", appName],
      ["%%FILE%%", outputExePath],
      ["%%FILEDIR%%", exeDir],
      ["%%VERSION%%", version],
      ["%%AUTHOR%%", author],
      ["%%IMAGE%%", this.config.image ?? ''],
      ["%%ICON%%", this.config.icon ?? ''],
    ]
    for (const couple of replaces) {
      template = template.replace(new RegExp(couple[0],"g"), couple[1])
    }

    _fs.default.writeFileSync(templateTempPath, template);

    await _makensis.compile(templateTempPath, nsisOptions)
    .then((output) => {
        console.log('Compiler output:', output);
    })
    .catch((error) => {
        console.error(error);
    });

    return [outputExePath];
  }


}

exports.default = MakerNSIS;
