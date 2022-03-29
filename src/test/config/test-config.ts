import merge from 'deepmerge';
import {
    IAuthType,
    IUnleashConfig,
    IUnleashOptions,
} from '../../lib/types/option';
import getLogger from '../fixtures/no-logger';

import { createConfig } from '../../lib/create-config';
import { experimentalSegmentsConfig } from '../../lib/experimental';

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

export function createTestConfig(config?: IUnleashOptions): IUnleashConfig {
    const testConfig: IUnleashOptions = {
        getLogger,
        authentication: { type: IAuthType.NONE, createAdminUser: false },
        server: { secret: 'really-secret' },
        session: {
            db: false,
        },
        experimental: {
            segments: experimentalSegmentsConfig(),
        },
        versionCheck: { enable: false },
    };
    const options = mergeAll<IUnleashOptions>([testConfig, config]);
    return createConfig(options);
}
