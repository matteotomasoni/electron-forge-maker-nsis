import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';

import path from 'path';
import fs from 'fs';
// @ts-ignore
import * as NSIS from 'makensis';
import * as signtool from 'signtool';
import readdirp from 'readdirp';
import { execSync } from 'child_process';

export type MakerNSISConfig = {
  name:string,
  nsisOptions:NsisOptions,
  signOptions:signtool.SignOptions|undefined,
  signIncludedExecutables:boolean,
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

    const isUser = this.config.nsisOptions.define.EXECUTION_LEVEL == 'user' || false
    const exeName = this.config.name || `${appName}-${packageJSON.version}-${isUser ? 'User' : 'Admin'}Setup.exe`
    const outputExePath = path.resolve(makeDir, 'nsis', exeName);
    const outputTmpInstallerExePath = path.resolve(makeDir, 'nsis', 'TempInstaller.exe');
    const outputTmpUninstallerExePath = path.resolve(makeDir, 'nsis', 'Uninstall.exe');
    const templateName = 'templateForSignature.nsi'
    const originalTemplatePath = path.resolve(__dirname, templateName)
    const templateTempPath = path.resolve(dir, templateName)

    const nsisOptionsDefine : Define = {
      EXECUTION_LEVEL: 'admin',
      ... this.config.nsisOptions.define,
      MUI_PRODUCT: appName,
      MUI_FILE: outputExePath,
      MUI_VERSION: packageJSON.version,
      MUI_AUTHOR: packageJSON.author.name || packageJSON.author,
      TMP_INSTALLER_FILE: outputTmpInstallerExePath,
      TMP_UNINSTALLER_FILE: outputTmpUninstallerExePath,
    };

    const nsisOptions : NsisOptions = {
      ... this.config.nsisOptions,
      define: nsisOptionsDefine,
    };
    await this.ensureFile(outputExePath);

    fs.copyFileSync(originalTemplatePath, templateTempPath)

    // Sign all the included executables
    if(typeof this.config.signOptions !== 'undefined' && this.config.signIncludedExecutables === true) {
      const readdirpOptions = {
        fileFilter: ["*.exe", "*.dll"],
        depth: 10,
      }
      const files = await readdirp.promise(dir, readdirpOptions)
      for await (const item of files) {
        // If the verify fails, we sign the file
        try{
          await signtool.verify(item.fullPath, {defaultAuthPolicy:true})
        }
        catch(err) {
          await signtool.sign(item.fullPath, this.config.signOptions)
        }
      }
    }

    // generate the uninstaller
    const nsisUninstallerOptions : NsisOptions = JSON.parse(JSON.stringify(nsisOptions))
    nsisUninstallerOptions.define.INNER = "1"

    // This writes a temp installer for us which, when
    // it is invoked, will just write the uninstaller to some location, and then exit.
    let output = await NSIS.compile(templateTempPath, nsisUninstallerOptions)
    if(output.status !== 0) {
      console.log(output.stdout)
      throw "Error compiling uninstaller NSIS!"
    }

    // run the temp installer
    try{
      execSync(`set __COMPAT_LAYER=RunAsInvoker&"${outputTmpInstallerExePath}"`)
    }
    catch(err) {
      // ignore the error: since it calls quit the return value isn't zero.
    }

    // Optional: Sign the uninstaller
    if(typeof this.config.signOptions !== 'undefined') {
      await signtool.sign(outputTmpUninstallerExePath, this.config.signOptions)
    }

    // remove the temp installer
    fs.unlinkSync(outputTmpInstallerExePath)

    // generate the real installer
    output = await NSIS.compile(templateTempPath, nsisOptions)
    if(output.status !== 0) {
      console.log(output.stdout)
      throw "Error compiling NSIS!"
    }

    fs.unlinkSync(templateTempPath)

    // Optional: Sign the installer
    if(typeof this.config.signOptions !== 'undefined') {
      await signtool.sign(outputExePath, this.config.signOptions)
    }
    
    return [outputExePath];
  }
}