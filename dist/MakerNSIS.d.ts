import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import * as signtool from 'signtool';
export declare type MakerNSISConfig = {
    name: string;
    template?: string;
    nsisOptions: NsisOptions;
    signOptions?: signtool.SignOptions;
    signIncludedExecutables: boolean;
};
export declare type NsisOptions = {
    define: Define;
};
export declare type Define = {
    [key: string]: string;
};
export default class MakerNSIS extends MakerBase<MakerNSISConfig> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ dir, makeDir, appName, packageJSON, targetArch, targetPlatform, }: MakerOptions): Promise<string[]>;
}
