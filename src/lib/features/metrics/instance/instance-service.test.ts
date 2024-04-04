import ClientInstanceService from './instance-service';
import type { IClientApp } from '../../../types/model';
import FakeEventStore from '../../../../test/fixtures/fake-event-store';
import { createTestConfig } from '../../../../test/config/test-config';
import { FakePrivateProjectChecker } from '../../private-project/fakePrivateProjectChecker';
import type { IClientApplicationsStore, IUnleashConfig } from '../../../types';
import FakeClientMetricsStoreV2 from '../client-metrics/fake-client-metrics-store-v2';
import FakeStrategiesStore from '../../../../test/fixtures/fake-strategies-store';
import FakeFeatureToggleStore from '../../feature-toggle/fakes/fake-feature-toggle-store';
import type { IApplicationOverview } from './models';

let config: IUnleashConfig;
beforeAll(() => {
    config = createTestConfig({});
});
test('Multiple registrations of same appname and instanceid within same time period should only cause one registration', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new ClientInstanceService(
        {
            clientMetricsStoreV2: new FakeClientMetricsStoreV2(),
            strategyStore: new FakeStrategiesStore(),
            featureToggleStore: new FakeFeatureToggleStore(),
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: new FakeEventStore(),
        },
        config,
        new FakePrivateProjectChecker(),
    );
    const client1: IClientApp = {
        appName: 'test_app',
        instanceId: 'ava',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');

    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService

    expect(appStoreSpy).toHaveBeenCalledTimes(1);
    expect(bulkSpy).toHaveBeenCalledTimes(1);

    const registrations = appStoreSpy.mock.calls[0][0];

    expect(registrations.length).toBe(1);
    expect(registrations[0].appName).toBe(client1.appName);
    expect(registrations[0].instanceId).toBe(client1.instanceId);
    expect(registrations[0].started).toBe(client1.started);
    expect(registrations[0].interval).toBe(client1.interval);

    jest.useRealTimers();
});

test('Multiple unique clients causes multiple registrations', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };

    const clientMetrics = new ClientInstanceService(
        {
            clientMetricsStoreV2: new FakeClientMetricsStoreV2(),
            strategyStore: new FakeStrategiesStore(),
            featureToggleStore: new FakeFeatureToggleStore(),
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: new FakeEventStore(),
        },
        config,
        new FakePrivateProjectChecker(),
    );
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    const client2 = {
        appName: 'test_app_2',
        instanceId: 'client2',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');
    await clientMetrics.registerClient(client2, '127.0.0.1');

    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService

    const registrations = appStoreSpy.mock.calls[0][0];

    expect(registrations.length).toBe(2);
});

test('Same client registered outside of dedup interval will be registered twice', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };

    const clientMetrics = new ClientInstanceService(
        {
            clientMetricsStoreV2: new FakeClientMetricsStoreV2(),
            strategyStore: new FakeStrategiesStore(),
            featureToggleStore: new FakeFeatureToggleStore(),
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: new FakeEventStore(),
        },
        config,
        new FakePrivateProjectChecker(),
    );
    const client1 = {
        appName: 'test_app',
        instanceId: 'client1',
        strategies: [{ name: 'defaullt' }],
        started: new Date(),
        interval: 10,
    };
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');

    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService

    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');
    await clientMetrics.registerClient(client1, '127.0.0.1');

    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService

    expect(appStoreSpy).toHaveBeenCalledTimes(2);
    expect(bulkSpy).toHaveBeenCalledTimes(2);

    const firstRegistrations = appStoreSpy.mock.calls[0][0][0];
    const secondRegistrations = appStoreSpy.mock.calls[1][0][0];

    expect(firstRegistrations.appName).toBe(secondRegistrations.appName);
    expect(firstRegistrations.instanceId).toBe(secondRegistrations.instanceId);
});

test('No registrations during a time period will not call stores', async () => {
    const appStoreSpy = jest.fn();
    const bulkSpy = jest.fn();
    const clientApplicationsStore: any = {
        bulkUpsert: appStoreSpy,
    };
    const clientInstanceStore: any = {
        bulkUpsert: bulkSpy,
    };
    const clientMetrics = new ClientInstanceService(
        {
            clientMetricsStoreV2: new FakeClientMetricsStoreV2(),
            strategyStore: new FakeStrategiesStore(),
            featureToggleStore: new FakeFeatureToggleStore(),
            clientApplicationsStore,
            clientInstanceStore,
            eventStore: new FakeEventStore(),
        },
        config,
        new FakePrivateProjectChecker(),
    );

    await clientMetrics.bulkAdd(); // in prod called by a SchedulerService

    expect(appStoreSpy).toHaveBeenCalledTimes(0);
    expect(bulkSpy).toHaveBeenCalledTimes(0);
});

test('filter out private projects from overview', async () => {
    const clientApplicationsStore = {
        async getApplicationOverview(
            appName: string,
        ): Promise<IApplicationOverview> {
            return {
                environments: [
                    {
                        name: 'development',
                        instanceCount: 1,
                        sdks: ['unleash-client-node:3.5.1'],
                        lastSeen: new Date(),
                        issues: {
                            missingFeatures: [],
                            outdatedSdks: [],
                        },
                    },
                ],
                projects: ['privateProject', 'publicProject'],
                issues: {
                    missingStrategies: [],
                },
                featureCount: 0,
            };
        },
    } as IClientApplicationsStore;
    const privateProjectsChecker = {
        async filterUserAccessibleProjects(
            userId: number,
            projects: string[],
        ): Promise<string[]> {
            return projects.filter((project) => !project.includes('private'));
        },
    } as FakePrivateProjectChecker;
    const clientInstanceService = new ClientInstanceService(
        { clientApplicationsStore } as any,
        config,
        privateProjectsChecker,
    );

    const overview = await clientInstanceService.getApplicationOverview(
        'appName',
        123,
    );

    expect(overview).toMatchObject({
        environments: [
            {
                name: 'development',
                instanceCount: 1,
                sdks: ['unleash-client-node:3.5.1'],
                issues: {
                    missingFeatures: [],
                    outdatedSdks: ['unleash-client-node:3.5.1'],
                },
            },
        ],
        projects: ['publicProject'],
        issues: {
            missingStrategies: [],
        },
        featureCount: 0,
    });
});
