import dbInit, { type ITestDb } from '../../test/e2e/helpers/database-init.js';
import getLogger from '../../test/fixtures/no-logger.js';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { IClientApplicationsStore } from '../types/stores/client-applications-store.js';
import type ClientApplicationsStore from './client-applications-store.js';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('client_applications_store_serial', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

describe('ClientApplicationsStore', () => {
    let service: IClientApplicationsStore;

    beforeAll(() => {
        service = db.stores.clientApplicationsStore as ClientApplicationsStore;
    });

    describe('mapApplicationOverviewData()', () => {
        describe('handling deprecated strategies', () => {
            test('should not count any of the four deprecated strategies as missing', () => {
                const DEPRECATED_STRATEGIES = [
                    'gradualRolloutRandom',
                    'gradualRolloutSessionId',
                    'gradualRolloutUserId',
                    'userWithId',
                ];

                const rows = [
                    {
                        environment: 'staging',
                        unique_instance_count: 3,
                        sdk_versions: ['2.5.0'],
                        frontend_sdks: [],
                        backend_sdks: ['java-2.5.0'],
                        latest_last_seen: new Date().toISOString(),
                        project: 'test-project',
                        features: ['feature-a', 'feature-b'],
                        strategies: DEPRECATED_STRATEGIES,
                    },
                ];

                const existingStrategies = [];
                const result = service.mapApplicationOverviewData(
                    rows,
                    existingStrategies,
                );

                expect(result.issues.missingStrategies).toStrictEqual([]);
            });

            test('should only report truly missing strategies, excluding deprecated ones', () => {
                const rows = [
                    {
                        environment: 'production',
                        unique_instance_count: 10,
                        sdk_versions: ['3.0.0'],
                        frontend_sdks: ['react-3.0.0'],
                        backend_sdks: [],
                        latest_last_seen: new Date().toISOString(),
                        project: 'main-project',
                        features: ['feature-x'],
                        strategies: [
                            'gradualRolloutRandom', // deprecated - should be ignored
                            'customStrategy', // should be reported
                            'anotherCustom', // should be reported
                        ],
                    },
                ];

                const existingStrategies = ['defaultStrategy'];
                const result = service.mapApplicationOverviewData(
                    rows,
                    existingStrategies,
                );

                expect(result.issues.missingStrategies).toHaveLength(2);
                expect(result.issues.missingStrategies).toContain(
                    'customStrategy',
                );
                expect(result.issues.missingStrategies).toContain(
                    'anotherCustom',
                );
                expect(result.issues.missingStrategies).not.toContain(
                    'gradualRolloutRandom',
                );
            });

            test('should correctly map multiple environments with their metadata', () => {
                const rows = [
                    {
                        environment: 'development',
                        unique_instance_count: 2,
                        sdk_versions: ['2.0.0'],
                        frontend_sdks: ['vue-2.0.0'],
                        backend_sdks: [],
                        latest_last_seen: new Date().toISOString(),
                        project: 'dev-project',
                        features: ['feature-dev'],
                        strategies: ['userWithId'], // deprecated
                    },
                    {
                        environment: 'production',
                        unique_instance_count: 20,
                        sdk_versions: ['3.2.0'],
                        frontend_sdks: [],
                        backend_sdks: ['python-3.2.0'],
                        latest_last_seen: new Date().toISOString(),
                        project: 'prod-project',
                        features: ['feature-prod'],
                        strategies: ['gradualRolloutSessionId'], // deprecated
                    },
                ];

                const existingStrategies = [];
                const result = service.mapApplicationOverviewData(
                    rows,
                    existingStrategies,
                );

                expect(result.environments).toHaveLength(2);
                expect(result.environments.map((e) => e.name)).toContain(
                    'development',
                );
                expect(result.environments.map((e) => e.name)).toContain(
                    'production',
                );
                expect(result.issues.missingStrategies).toStrictEqual([]);
            });

            test('should deduplicate missing strategies across multiple rows', () => {
                const rows = [
                    {
                        environment: 'production',
                        unique_instance_count: 5,
                        sdk_versions: [],
                        frontend_sdks: [],
                        backend_sdks: [],
                        latest_last_seen: new Date().toISOString(),
                        project: 'proj-1',
                        features: ['f1'],
                        strategies: ['customStrategy', 'gradualRolloutRandom'],
                    },
                    {
                        environment: 'staging',
                        unique_instance_count: 3,
                        sdk_versions: [],
                        frontend_sdks: [],
                        backend_sdks: [],
                        latest_last_seen: new Date().toISOString(),
                        project: 'proj-1',
                        features: ['f2'],
                        strategies: ['customStrategy', 'userWithId'],
                    },
                ];

                const existingStrategies = [];
                const result = service.mapApplicationOverviewData(
                    rows,
                    existingStrategies,
                );

                expect(result.issues.missingStrategies).toHaveLength(1);
                expect(result.issues.missingStrategies).toContain(
                    'customStrategy',
                );
            });
        });
    });
});
