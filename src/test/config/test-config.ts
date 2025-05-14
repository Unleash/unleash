import merge from 'deepmerge';
import {
    IAuthType,
    type IUnleashConfig,
    type IUnleashOptions,
} from '../../lib/types/option.js';
import getLogger from '../fixtures/no-logger.js';
import { createConfig } from '../../lib/create-config.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function createTestConfig(config?: IUnleashOptions): IUnleashConfig {
    getLogger.setMuteError(true);
    const testConfig: IUnleashOptions = {
        getLogger,
        authentication: { type: IAuthType.NONE, createAdminUser: false },
        server: { secret: 'really-secret' },
        session: { db: false },
        versionCheck: { enable: false },
        disableScheduler: true,
        clientFeatureCaching: {
            enabled: false,
        },
        publicFolder: path.join(__dirname, '../examples'),
    };
    const options = mergeAll<IUnleashOptions>([testConfig, config || {}]);
    return createConfig(options);
}
