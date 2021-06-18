"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// @ts-ignore
const NSIS = require('makensis');
class MakerNSIS extends maker_base_1.default {
    constructor() {
        super(...arguments);
        this.name = 'nsis';
        this.defaultPlatforms = ['win32'];
    }
    isSupportedOnCurrentPlatform() {
        return true;
    }
    make({ dir, makeDir, appName, packageJSON, targetArch, targetPlatform, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalTemplatePath = path_1.default.resolve(__dirname, 'template.nsi');
            const templateTempPath = path_1.default.resolve(dir, 'template.nsi');
            const isUser = this.config.nsisOptions.define.EXECUTION_LEVEL == 'user' || false;
            const exeName = this.config.name || `${appName}-${packageJSON.version}-${isUser ? 'User' : 'Admin'}Setup.exe`;
            const outputExePath = path_1.default.resolve(makeDir, 'nsis', exeName);
            const nsisOptionsDefine = Object.assign(Object.assign({ EXECUTION_LEVEL: 'admin' }, this.config.nsisOptions.define), { MUI_PRODUCT: appName, MUI_FILE: outputExePath, MUI_VERSION: packageJSON.version, MUI_AUTHOR: packageJSON.author.name || packageJSON.author });
            const nsisOptions = Object.assign(Object.assign({}, this.config.nsisOptions), { define: nsisOptionsDefine });
            yield this.ensureFile(outputExePath);
            fs_1.default.copyFileSync(originalTemplatePath, templateTempPath);
            let output = yield NSIS.compile(templateTempPath, nsisOptions);
            if (output.status !== 0) {
                console.log(output.stdout);
                throw "Error compiling NSIS!";
            }
            fs_1.default.unlinkSync(templateTempPath);
            return [outputExePath];
        });
    }
}
exports.default = MakerNSIS;
//# sourceMappingURL=MakerNSIS.js.map