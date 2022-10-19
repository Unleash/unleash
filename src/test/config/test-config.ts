import merge from 'deepmerge';
import {
    IAuthType,
    IUnleashConfig,
    IUnleashOptions,
} from '../../lib/types/option';
import getLogger from '../fixtures/no-logger';
import { createConfig } from '../../lib/create-config';

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

export function createTestConfig(config?: IUnleashOptions): IUnleashConfig {
    const testConfig: IUnleashOptions = {
        getLogger,
        authentication: { type: IAuthType.NONE, createAdminUser: false },
        server: { secret: 'really-secret' },
        session: { db: false },
        versionCheck: { enable: false },
        enableOAS: true,
        clientFeatureCaching: {
            enabled: false,
        },
        experimental: {
            flags: {
                embedProxy: true,
                embedProxyFrontend: true,
                batchMetrics: true,
                personalAccessTokens: true,
                syncSSOGroups: true,
            },
        },
    };
    const options = mergeAll<IUnleashOptions>([testConfig, config]);
    return createConfig(options);
}
