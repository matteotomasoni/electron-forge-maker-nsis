import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';

import path from 'path';
import fs from 'fs';
// @ts-ignore
import * as NSIS from 'makensis';
import * as signtool from 'signtool';

export type MakerNSISConfig = {
  name:string,
  nsisOptions:NsisOptions,
  signOptions:signtool.SignOptions|false,
};

export type NsisOptions = {
  define:Define,
};

// just a collection of definitions, like a Map of strings
export type Define = {
  [key:string]:string,
};

  

export default class MakerNSIS extends MakerBase<MakerNSISConfig> {
  name = 'nsis';

  defaultPlatforms: ForgePlatform[] = ['win32'];

  isSupportedOnCurrentPlatform() {
    return true;
  }

  async make({
    dir,
    makeDir,
    appName,
    packageJSON,
    targetArch,
    targetPlatform,
  }: MakerOptions) {

    const originalTemplatePath = path.resolve(__dirname, 'template.nsi');
    const templateTempPath = path.resolve(dir, 'template.nsi');
    const isUser = this.config.nsisOptions.define.EXECUTION_LEVEL == 'user' || false
    const exeName = this.config.name || `${appName}-${packageJSON.version}-${isUser ? 'User' : 'Admin'}Setup.exe`
    const outputExePath = path.resolve(makeDir, 'nsis', exeName);

    const nsisOptionsDefine = {
      EXECUTION_LEVEL: 'admin',
      ... this.config.nsisOptions.define,
      MUI_PRODUCT: appName,
      MUI_FILE: outputExePath,
      MUI_VERSION: packageJSON.version,
      MUI_AUTHOR: packageJSON.author.name || packageJSON.author,
    };

    const nsisOptions = {
      ... this.config.nsisOptions,
      define: nsisOptionsDefine,
    };
    await this.ensureFile(outputExePath);

    fs.copyFileSync(originalTemplatePath, templateTempPath)

    let output = await NSIS.compile(templateTempPath, nsisOptions)
    if(output.status !== 0) {
      console.log(output.stdout)
      throw "Error compiling NSIS!"
    }

    fs.unlinkSync(templateTempPath)

    if(this.config.hasOwnProperty('signOptions') && this.config.signOptions !== false) {
      await signtool.sign(outputExePath, this.config.signOptions)
    }
    
    return [outputExePath];
  }
}