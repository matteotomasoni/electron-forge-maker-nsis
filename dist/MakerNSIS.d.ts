import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
export declare type MakerNSISConfig = {};
export default class MakerNSIS extends MakerBase<MakerNSISConfig> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ dir, makeDir, appName, packageJSON, targetArch, targetPlatform, }: MakerOptions): Promise<string[]>;
}
