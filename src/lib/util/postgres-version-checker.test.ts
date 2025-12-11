import type { ISettingStore, IUnleashConfig } from '../types/index.js';
import { createTestConfig } from '../../test/config/test-config.js';
import { compareAndLogPostgresVersion } from './postgres-version-checker.js';
import FakeSettingStore from '../../test/fixtures/fake-setting-store.js';

import { vi } from 'vitest';

let config: IUnleashConfig;
let settingStore: ISettingStore;
let infoMessages: string[];
let errorMessages: string[];

const fakeSettingStore = (postgresVersion: string): ISettingStore => {
    const temp = new FakeSettingStore();
    vi.spyOn(temp, 'postgresVersion').mockResolvedValue(postgresVersion);
    return temp;
};

beforeEach(() => {
    infoMessages = [];
    errorMessages = [];
    config = createTestConfig({
        getLogger: () => {
            return {
                info: (message: string) => {
                    infoMessages.push(message);
                },
                error: (message: string) => {
                    errorMessages.push(message);
                },
                warn: (_message: string) => {},
                debug: (_message: string) => {},
                fatal(_message: any, ..._args) {},
            };
        },
    });
});
test.each([
    '13.9.2',
    '12.1.7',
    '12.1',
    '11.1',
    '10.1',
    '9.6',
])('Postgres version %s yields error message', async (version) => {
    settingStore = fakeSettingStore(version);
    await compareAndLogPostgresVersion(config, settingStore);
    expect(errorMessages).toHaveLength(1);
    expect(infoMessages).toHaveLength(0);
});
test.each([
    '14.9',
    '15.9',
    '16.2',
    '17',
])('Postgres version %s yields an info message', async (version) => {
    settingStore = fakeSettingStore(version);
    await compareAndLogPostgresVersion(config, settingStore);
    expect(errorMessages).toHaveLength(0);
    expect(infoMessages).toHaveLength(1);
});
