import type { UniversalPHP } from '@php-wasm/universal';
export interface InstallAssetOptions {
    /**
     * The zip file to install.
     */
    zipFile: File;
    /**
     * Target path to extract the main folder.
     * @example
     *
     * <code>
     * const targetPath = `${await playground.documentRoot}/wp-content/plugins`;
     * </code>
     */
    targetPath: string;
    /**
     * Target folder name to install the asset into.
     */
    targetFolderName?: string;
    /**
     * What to do if the asset already exists.
     */
    ifAlreadyInstalled?: 'overwrite' | 'skip' | 'error';
}
/**
 * Install asset: Extract folder from zip file and move it to target
 */
export declare function installAsset(playground: UniversalPHP, { targetPath, zipFile, ifAlreadyInstalled, targetFolderName }: InstallAssetOptions): Promise<{
    assetFolderPath: string;
    assetFolderName: string;
}>;
