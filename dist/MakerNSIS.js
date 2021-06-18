"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// @ts-ignore
const NSIS = __importStar(require("makensis"));
const signtool = __importStar(require("signtool"));
const readdirp_1 = __importDefault(require("readdirp"));
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
        var e_1, _a;
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
            // Sign all the included executables
            if (typeof this.config.signOptions !== 'undefined' && this.config.signIncludedExecutables === true) {
                const readdirpOptions = {
                    fileFilter: ["*.exe", "*.dll"],
                    depth: 10,
                };
                const files = yield readdirp_1.default.promise(dir, readdirpOptions);
                try {
                    for (var files_1 = __asyncValues(files), files_1_1; files_1_1 = yield files_1.next(), !files_1_1.done;) {
                        const item = files_1_1.value;
                        // If the verify fails, we sign the file
                        try {
                            yield signtool.verify(item.fullPath, { defaultAuthPolicy: true });
                        }
                        catch (err) {
                            yield signtool.sign(item.fullPath, this.config.signOptions);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (files_1_1 && !files_1_1.done && (_a = files_1.return)) yield _a.call(files_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            let output = yield NSIS.compile(templateTempPath, nsisOptions);
            if (output.status !== 0) {
                console.log(output.stdout);
                throw "Error compiling NSIS!";
            }
            fs_1.default.unlinkSync(templateTempPath);
            // Sign the output executable
            if (typeof this.config.signOptions !== 'undefined') {
                yield signtool.sign(outputExePath, this.config.signOptions);
            }
            return [outputExePath];
        });
    }
}
exports.default = MakerNSIS;
//# sourceMappingURL=MakerNSIS.js.map