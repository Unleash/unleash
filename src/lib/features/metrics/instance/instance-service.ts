import type EventEmitter from 'events';
import { APPLICATION_CREATED, CLIENT_REGISTER } from '../../../events/index.js';
import type { IApplication, IApplicationOverview } from './models.js';
import type { IUnleashStores } from '../../../types/stores.js';
import type { IUnleashConfig } from '../../../types/option.js';
import type { IEventStore } from '../../../types/stores/event-store.js';
import type {
    IClientApplication,
    IClientApplications,
    IClientApplicationsSearchParams,
    IClientApplicationsStore,
} from '../../../types/stores/client-applications-store.js';
import type { IFeatureToggleStore } from '../../feature-toggle/types/feature-toggle-store-type.js';
import type { IStrategyStore } from '../../../types/stores/strategy-store.js';
import type { IClientInstanceStore } from '../../../types/stores/client-instance-store.js';
import type {
    IClientApp,
    IFrontendClientApp,
    ISdkHeartbeat,
} from '../../../types/model.js';
import { clientRegisterSchema } from '../shared/schema.js';

import type { IClientMetricsStoreV2 } from '../client-metrics/client-metrics-store-v2-type.js';
import type { IPrivateProjectChecker } from '../../private-project/privateProjectCheckerType.js';
import {
    type ApplicationCreatedEvent,
    type IFlagResolver,
    SYSTEM_USER,
} from '../../../types/index.js';
import { ALL_PROJECTS, parseStrictSemVer } from '../../../util/index.js';
import type { Logger } from '../../../logger.js';
import { findOutdatedSDKs, isOutdatedSdk } from './findOutdatedSdks.js';
import type { OutdatedSdksSchema } from '../../../openapi/spec/outdated-sdks-schema.js';
import { CLIENT_REGISTERED } from '../../../metric-events.js';
import { NotFoundError } from '../../../error/index.js';
import type { ClientMetricsSchema, PartialSome } from '../../../server-impl.js';

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

    private eventBus: EventEmitter;

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
            eventBus,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
        privateProjectChecker: IPrivateProjectChecker,
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.eventStore = eventStore;
        this.eventBus = eventBus;
        this.privateProjectChecker = privateProjectChecker;
        this.flagResolver = flagResolver;
        this.logger = getLogger(
            '/services/client-metrics/client-instance-service.ts',
        );
    }

    private updateSeenClient = (data: IClientApp) => {
        const current = this.seenClients[this.clientKey(data)];
        this.seenClients[this.clientKey(data)] = {
            ...current,
            ...data,
        };
    };

    public async registerInstance(
        data: Pick<
            ClientMetricsSchema,
            'appName' | 'instanceId' | 'environment'
        >,
        clientIp: string,
    ): Promise<void> {
        this.updateSeenClient({
            appName: data.appName,
            instanceId: data.instanceId ?? 'default',
            environment: data.environment,
            clientIp: clientIp,
        });
    }

    public registerFrontendClient(data: IFrontendClientApp): void {
        data.createdBy = SYSTEM_USER.username!;

        this.updateSeenClient(data);
    }

    public async registerBackendClient(
        data: PartialSome<IClientApp, 'instanceId'>,
        clientIp: string,
    ): Promise<void> {
        const value = await clientRegisterSchema.validateAsync(data);
        value.clientIp = clientIp;
        value.createdBy = SYSTEM_USER.username!;
        value.sdkType = 'backend';
        this.updateSeenClient(value);
        this.eventBus.emit(CLIENT_REGISTERED, value);

        if (value.sdkVersion && value.sdkVersion.indexOf(':') > -1) {
            const [sdkName, sdkVersion] = value.sdkVersion.split(':');
            const heartbeatEvent: ISdkHeartbeat = {
                sdkName,
                sdkVersion,
                metadata: {
                    platformName: data.platformName,
                    platformVersion: data.platformVersion,
                    yggdrasilVersion: data.yggdrasilVersion,
                    specVersion: data.specVersion,
                },
            };

            this.eventStore.emit(CLIENT_REGISTER, heartbeatEvent);
        }
    }

    async announceUnannounced(): Promise<void> {
        if (this.clientApplicationsStore) {
            const appsToAnnounce =
                await this.clientApplicationsStore.setUnannouncedToAnnounced();
            if (appsToAnnounce.length > 0) {
                const events: ApplicationCreatedEvent[] = appsToAnnounce.map(
                    (app) => ({
                        type: APPLICATION_CREATED,
                        createdBy: app.createdBy || SYSTEM_USER.username!,
                        data: app,
                        createdByUserId: app.createdByUserId || SYSTEM_USER.id,
                        ip: '', // TODO: fix this, how do we get the ip from the client? This comes from a row in the DB
                    }),
                );
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
                    let existingProjects = [];
                    if (soFar[`${reg.appName} ${reg.environment}`]) {
                        existingProjects =
                            soFar[`${reg.appName} ${reg.environment}`]
                                .projects || [];
                    }
                    soFar[`${reg.appName} ${reg.environment}`] = {
                        ...reg,
                        projects: [
                            ...existingProjects,
                            ...(reg.projects || []),
                        ],
                    };
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
        const applications = await this.clientApplicationsStore.getApplications(
            { ...query, sortBy: query.sortBy || 'appName' },
        );
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
        if (application === undefined) {
            throw new NotFoundError(
                `Could not find application with appName ${appName}`,
            );
        }
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
        userId: number,
    ): Promise<IApplicationOverview> {
        const result =
            await this.clientApplicationsStore.getApplicationOverview(appName);
        const accessibleProjects =
            await this.privateProjectChecker.filterUserAccessibleProjects(
                userId,
                result.projects,
            );
        result.projects = accessibleProjects;
        result.environments.forEach((environment) => {
            environment.issues.outdatedSdks = findOutdatedSDKs(
                environment.sdks,
            );
        });
        return result;
    }

    async getRecentApplicationEnvironmentInstances(
        appName: string,
        environment: string,
    ) {
        const instances =
            await this.clientInstanceStore.getRecentByAppNameAndEnvironment(
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

    async removeOldInstances(): Promise<void> {
        return this.clientInstanceStore.removeOldInstances();
    }

    async removeInactiveApplications(): Promise<number> {
        return this.clientApplicationsStore.removeInactiveApplications();
    }

    async getOutdatedSdks(): Promise<OutdatedSdksSchema['sdks']> {
        const sdkApps = await this.clientInstanceStore.groupApplicationsBySdk();

        return sdkApps.filter((sdkApp) => isOutdatedSdk(sdkApp.sdkVersion));
    }

    async getOutdatedSdksByProject(
        projectId: string,
    ): Promise<OutdatedSdksSchema['sdks']> {
        const sdkApps =
            await this.clientInstanceStore.groupApplicationsBySdkAndProject(
                projectId,
            );

        return sdkApps.filter((sdkApp) => isOutdatedSdk(sdkApp.sdkVersion));
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
