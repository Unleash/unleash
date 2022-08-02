import { applicationSchema } from './schema';
import { APPLICATION_CREATED, CLIENT_REGISTER } from '../../types/events';
import { IApplication } from './models';
import { IUnleashStores } from '../../types/stores';
import { IUnleashConfig } from '../../types/option';
import { IEventStore } from '../../types/stores/event-store';
import {
    IClientApplication,
    IClientApplicationsStore,
} from '../../types/stores/client-applications-store';
import { IFeatureToggleStore } from '../../types/stores/feature-toggle-store';
import { IStrategyStore } from '../../types/stores/strategy-store';
import { IClientInstanceStore } from '../../types/stores/client-instance-store';
import { IApplicationQuery } from '../../types/query';
import { IClientApp } from '../../types/model';
import { clientRegisterSchema } from './schema';

import { minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { IClientMetricsStoreV2 } from '../../types/stores/client-metrics-store-v2';
import { clientMetricsSchema } from './schema';
import { PartialSome } from '../../types/partial';

export default class ClientInstanceService {
    apps = {};

    logger = null;

    seenClients: Record<string, IClientApp> = {};

    private timers: NodeJS.Timeout[] = [];

    private clientMetricsStoreV2: IClientMetricsStoreV2;

    private strategyStore: IStrategyStore;

    private featureToggleStore: IFeatureToggleStore;

    private clientApplicationsStore: IClientApplicationsStore;

    private clientInstanceStore: IClientInstanceStore;

    private eventStore: IEventStore;

    private bulkInterval: number;

    private announcementInterval: number;

    constructor(
        {
            clientMetricsStoreV2,
            strategyStore,
            featureToggleStore,
            clientInstanceStore,
            clientApplicationsStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            | 'clientMetricsStoreV2'
            | 'strategyStore'
            | 'featureToggleStore'
            | 'clientApplicationsStore'
            | 'clientInstanceStore'
            | 'eventStore'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        bulkInterval = secondsToMilliseconds(5),
        announcementInterval = minutesToMilliseconds(5),
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.eventStore = eventStore;

        this.logger = getLogger(
            '/services/client-metrics/client-instance-service.ts',
        );

        this.bulkInterval = bulkInterval;
        this.announcementInterval = announcementInterval;
        this.timers.push(
            setInterval(() => this.bulkAdd(), this.bulkInterval).unref(),
        );
        this.timers.push(
            setInterval(
                () => this.announceUnannounced(),
                this.announcementInterval,
            ).unref(),
        );
    }

    public async registerInstance(
        data: PartialSome<IClientApp, 'instanceId'>,
        clientIp: string,
    ): Promise<void> {
        const value = await clientMetricsSchema.validateAsync(data);
        await this.clientInstanceStore.setLastSeen({
            appName: value.appName,
            instanceId: value.instanceId,
            environment: value.environment,
            clientIp: clientIp,
        });
    }

    public async registerClient(
        data: PartialSome<IClientApp, 'instanceId'>,
        clientIp: string,
    ): Promise<void> {
        const value = await clientRegisterSchema.validateAsync(data);
        value.clientIp = clientIp;
        value.createdBy = clientIp;
        this.seenClients[this.clientKey(value)] = value;
        this.eventStore.emit(CLIENT_REGISTER, value);
    }

    async announceUnannounced(): Promise<void> {
        if (this.clientApplicationsStore) {
            const appsToAnnounce =
                await this.clientApplicationsStore.setUnannouncedToAnnounced();
            if (appsToAnnounce.length > 0) {
                const events = appsToAnnounce.map((app) => ({
                    type: APPLICATION_CREATED,
                    createdBy: app.createdBy || 'unknown',
                    data: app,
                }));
                await this.eventStore.batchStore(events);
            }
        }
    }

    clientKey(client: IClientApp): string {
        return `${client.appName}_${client.instanceId}`;
    }

    async bulkAdd(): Promise<void> {
        if (
            this &&
            this.seenClients &&
            this.clientApplicationsStore &&
            this.clientInstanceStore
        ) {
            const uniqueRegistrations = Object.values(this.seenClients);
            const uniqueApps = Object.values(
                uniqueRegistrations.reduce((soFar, reg) => {
                    // eslint-disable-next-line no-param-reassign
                    soFar[reg.appName] = reg;
                    return soFar;
                }, {}),
            );
            this.seenClients = {};
            try {
                if (uniqueRegistrations.length > 0) {
                    await this.clientApplicationsStore.bulkUpsert(uniqueApps);
                    await this.clientInstanceStore.bulkUpsert(
                        uniqueRegistrations,
                    );
                }
            } catch (err) {
                this.logger.warn('Failed to register clients', err);
            }
        }
    }

    async getApplications(
        query: IApplicationQuery,
    ): Promise<IClientApplication[]> {
        return this.clientApplicationsStore.getAppsForStrategy(query);
    }

    async getApplication(appName: string): Promise<IApplication> {
        const [seenToggles, application, instances, strategies, features] =
            await Promise.all([
                this.clientMetricsStoreV2.getSeenTogglesForApp(appName),
                this.clientApplicationsStore.get(appName),
                this.clientInstanceStore.getByAppName(appName),
                this.strategyStore.getAll(),
                this.featureToggleStore.getAll(),
            ]);

        return {
            appName: application.appName,
            createdAt: application.createdAt,
            description: application.description,
            url: application.url,
            color: application.color,
            icon: application.icon,
            strategies: application.strategies.map((name) => {
                const found = strategies.find((f) => f.name === name);
                return found || { name, notFound: true };
            }),
            instances,
            seenToggles: seenToggles.map((name) => {
                const found = features.find((f) => f.name === name);
                return found || { name, notFound: true };
            }),
            links: {
                self: `/api/applications/${application.appName}`,
            },
        };
    }

    async deleteApplication(appName: string): Promise<void> {
        await this.clientInstanceStore.deleteForApplication(appName);
        await this.clientApplicationsStore.delete(appName);
    }

    async createApplication(input: IApplication): Promise<void> {
        const applicationData = await applicationSchema.validateAsync(input);
        await this.clientApplicationsStore.upsert(applicationData);
    }

    destroy(): void {
        this.timers.forEach(clearInterval);
    }
}
