import type { ISettingStore, IUnleashConfig } from '../types';
import { createTestConfig } from '../../test/config/test-config';
import { compareAndLogPostgresVersion } from './postgres-version-checker';
import FakeSettingStore from '../../test/fixtures/fake-setting-store';

let config: IUnleashConfig;
let settingStore: ISettingStore;
let infoMessages: string[];
let errorMessages: string[];

const fakeSettingStore = (postgresVersion: string): ISettingStore => {
    const temp = new FakeSettingStore();
    jest.spyOn(temp, 'postgresVersion').mockResolvedValue(postgresVersion);
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
                warn: (message: string) => {},
                debug: (message: string) => {},
                fatal(message: any, ...args) {},
            };
        },
    });
});
describe('postgres-version-checker', () => {
    describe('Postgres version below 13.0 will yield error messages', () => {
        test('12.1.7', async () => {
            settingStore = fakeSettingStore('12.1.7');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('12.1', async () => {
            settingStore = fakeSettingStore('12.1');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('11.1', async () => {
            settingStore = fakeSettingStore('11.1');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('10.1', async () => {
            settingStore = fakeSettingStore('10.1');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('9.6', async () => {
            settingStore = fakeSettingStore('9.6');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
    });
    describe('Postgres version at 13.0 or higher will yield an info message', () => {
        test('13.9.2', async () => {
            settingStore = fakeSettingStore('13.9.2');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('14.9', async () => {
            settingStore = fakeSettingStore('14.9');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('15.9', async () => {
            settingStore = fakeSettingStore('15.9');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('16.2', async () => {
            settingStore = fakeSettingStore('16.2');
            await compareAndLogPostgresVersion(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
    });
});
