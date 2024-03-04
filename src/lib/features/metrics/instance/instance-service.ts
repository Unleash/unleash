import { APPLICATION_CREATED, CLIENT_REGISTER } from '../../../types/events';
import { IApplication, IApplicationOverview } from './models';
import { IUnleashStores } from '../../../types/stores';
import { IUnleashConfig } from '../../../types/option';
import { IEventStore } from '../../../types/stores/event-store';
import {
    IClientApplication,
    IClientApplications,
    IClientApplicationsSearchParams,
    IClientApplicationsStore,
} from '../../../types/stores/client-applications-store';
import { IFeatureToggleStore } from '../../feature-toggle/types/feature-toggle-store-type';
import { IStrategyStore } from '../../../types/stores/strategy-store';
import { IClientInstanceStore } from '../../../types/stores/client-instance-store';
import { IClientApp } from '../../../types/model';
import { clientRegisterSchema } from '../shared/schema';

import { IClientMetricsStoreV2 } from '../client-metrics/client-metrics-store-v2-type';
import { clientMetricsSchema } from '../shared/schema';
import { PartialSome } from '../../../types/partial';
import { IPrivateProjectChecker } from '../../private-project/privateProjectCheckerType';
import { IFlagResolver, SYSTEM_USER } from '../../../types';
import { ALL_PROJECTS, parseStrictSemVer } from '../../../util';
import { Logger } from '../../../logger';
import { findOutdatedSDKs } from './findOutdatedSdks';

export default class ClientInstanceService {
    apps = {};

    logger: Logger;

    seenClients: Record<string, IClientApp> = {};

    private clientMetricsStoreV2: IClientMetricsStoreV2;

    private strategyStore: IStrategyStore;

    private featureToggleStore: IFeatureToggleStore;

    private clientApplicationsStore: IClientApplicationsStore;

    private clientInstanceStore: IClientInstanceStore;

    private eventStore: IEventStore;

    private privateProjectChecker: IPrivateProjectChecker;

    private flagResolver: IFlagResolver;

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
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.eventStore = eventStore;
        this.privateProjectChecker = privateProjectChecker;
        this.flagResolver = flagResolver;
        this.logger = getLogger(
            '/services/client-metrics/client-instance-service.ts',
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
                    createdBy: app.createdBy || SYSTEM_USER.username,
                    data: app,
                    createdByUserId: app.createdByUserId || SYSTEM_USER.id,
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
            const uniqueApps: Partial<IClientApplication>[] = Object.values(
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
        query: IClientApplicationsSearchParams,
        userId: number,
    ): Promise<IClientApplications> {
        const applications =
            await this.clientApplicationsStore.getApplications(query);
        const accessibleProjects =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (accessibleProjects.mode === 'all') {
            return applications;
        } else {
            return {
                applications: applications.applications.map((application) => {
                    return {
                        ...application,
                        usage: application.usage?.filter(
                            (usageItem) =>
                                usageItem.project === ALL_PROJECTS ||
                                accessibleProjects.projects.includes(
                                    usageItem.project,
                                ),
                        ),
                    };
                }),
                total: applications.total,
            };
        }
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

    async getApplicationOverview(
        appName: string,
    ): Promise<IApplicationOverview> {
        const result =
            await this.clientApplicationsStore.getApplicationOverview(appName);
        result.environments.forEach((environment) => {
            environment.issues.outdatedSdks = findOutdatedSDKs(
                environment.sdks,
            );
        });
        return result;
    }

    async getApplicationEnvironmentInstances(
        appName: string,
        environment: string,
    ) {
        const instances =
            await this.clientInstanceStore.getByAppNameAndEnvironment(
                appName,
                environment,
            );

        return instances.map((instance) => ({
            instanceId: instance.instanceId,
            clientIp: instance.clientIp,
            sdkVersion: instance.sdkVersion,
            lastSeen: instance.lastSeen,
        }));
    }

    async deleteApplication(appName: string): Promise<void> {
        await this.clientInstanceStore.deleteForApplication(appName);
        await this.clientApplicationsStore.delete(appName);
    }

    async createApplication(input: IApplication): Promise<void> {
        await this.clientApplicationsStore.upsert(input);
    }

    async removeInstancesOlderThanTwoDays(): Promise<void> {
        return this.clientInstanceStore.removeInstancesOlderThanTwoDays();
    }

    async usesSdkOlderThan(
        sdkName: string,
        sdkVersion: string,
    ): Promise<boolean> {
        const semver = parseStrictSemVer(sdkVersion);
        const instancesOfSdk =
            await this.clientInstanceStore.getBySdkName(sdkName);
        return instancesOfSdk.some((instance) => {
            if (instance.sdkVersion) {
                const [_sdkName, sdkVersion] = instance.sdkVersion.split(':');
                const instanceUsedSemver = parseStrictSemVer(sdkVersion);
                return (
                    instanceUsedSemver !== null &&
                    semver !== null &&
                    instanceUsedSemver < semver
                );
            }
        });
    }
}
