/* eslint-disable no-param-reassign */
import EventStore, { ICreateEvent } from '../../db/event-store';
import StrategyStore from '../../db/strategy-store';
import ClientApplicationsDb from '../../db/client-applications-store';
import ClientInstanceStore from '../../db/client-instance-store';
import { ClientMetricsStore } from '../../db/client-metrics-store';
import FeatureToggleStore from '../../db/feature-toggle-store';
import { LogProvider } from '../../logger';
import { IApplication, applicationSchema } from './metrics-schema';
import { Projection } from './projection';
import { clientMetricsSchema } from './client-metrics-schema';
import { APPLICATION_CREATED } from '../../types/events';

const TTLList = require('./ttl-list.js');
const { clientRegisterSchema } = require('./register-schema');

const FIVE_SECONDS = 5 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

export interface IYesNoCount {
    yes: number;
    no: number;
}

export interface IAppInstance {
    appName: string;
    instanceId: string;
    sdkVersion: string;
    clientIp: string;
    lastSeen: Date;
    createdAt: Date;
}

export interface IClientApp {
    appName: string;
    instanceId: string;
    clientIp?: string;
    seenToggles?: string[];
    metricsCount?: number;
    strategies?: string[] | Record<string, string>[];
    bucket?: any;
    count?: number;
    started?: number | Date;
    interval?: number;
    icon?: string;
    description?: string;
    color?: string;
}

export interface IAppFeature {
    name: string;
    description: string;
    type: string;
    project: string;
    enabled: boolean;
    stale: boolean;
    strategies: any;
    variants: any[];
    createdAt: Date;
    lastSeenAt: Date;
}

export interface IApplicationQuery {
    strategyName?: string;
}

export interface IAppName {
    appName: string;
}

export interface IMetricCounts {
    yes?: number;
    no?: number;
    variants?: Record<string, number>;
}

export interface IMetricsBucket {
    start: Date;
    stop: Date;
    toggles: IMetricCounts;
}

export class ClientMetricsService {
    globalCount = 0;

    apps = {};

    lastHourProjection = new Projection();

    lastMinuteProjection = new Projection();

    lastHourList = new TTLList({
        interval: 10000,
    });

    logger = null;

    lastMinuteList = new TTLList({
        interval: 10000,
        expireType: 'minutes',
        expireAmount: 1,
    });

    seenClients: Record<string, IClientApp> = {};

    private timers: NodeJS.Timeout[] = [];

    constructor(
        private clientMetricsStore: ClientMetricsStore,
        private strategyStore: StrategyStore,
        private toggleStore: FeatureToggleStore,
        private clientAppStore: ClientApplicationsDb,
        private clientInstanceStore: ClientInstanceStore,
        private eventStore: EventStore,
        private getLogger: LogProvider,
        private bulkInterval = FIVE_SECONDS,
        private announcementInterval = FIVE_MINUTES,
    ) {
        this.lastHourList.on('expire', toggles => {
            Object.keys(toggles).forEach(toggleName => {
                this.lastHourProjection.substract(
                    toggleName,
                    this.createCountObject(toggles[toggleName]),
                );
            });
        });
        this.lastMinuteList.on('expire', toggles => {
            Object.keys(toggles).forEach(toggleName => {
                this.lastMinuteProjection.substract(
                    toggleName,
                    this.createCountObject(toggles[toggleName]),
                );
            });
        });

        this.logger = this.getLogger('services/client-metrics/index.ts');

        this.timers.push(
            setInterval(() => this.bulkAdd(), this.bulkInterval).unref(),
        );
        this.timers.push(
            setInterval(
                () => this.announceUnannounced(),
                this.announcementInterval,
            ).unref(),
        );
        clientMetricsStore.on('metrics', m => this.addPayload(m));
    }

    async registerClientMetrics(
        data: IClientApp,
        clientIp: string,
    ): Promise<void> {
        const value = await clientMetricsSchema.validateAsync(data);
        const toggleNames = Object.keys(value.bucket.toggles);
        await this.toggleStore.lastSeenToggles(toggleNames);
        await this.clientMetricsStore.insert(value);
        await this.clientInstanceStore.insert({
            appName: value.appName,
            instanceId: value.instanceId,
            clientIp,
        });
    }

    async announceUnannounced(): Promise<void> {
        if (this.clientAppStore) {
            const appsToAnnounce = await this.clientAppStore.setUnannouncedToAnnounced();
            if (appsToAnnounce.length > 0) {
                const events = appsToAnnounce.map(app => ({
                    type: APPLICATION_CREATED,
                    createdBy: app.createdBy || 'unknown',
                    data: app,
                }));
                await this.eventStore.batchStore(events);
            }
        }
    }

    async registerClient(data: IClientApp, clientIp: string): Promise<void> {
        const value = await clientRegisterSchema.validateAsync(data);
        value.clientIp = clientIp;
        value.createdBy = clientIp;
        this.seenClients[this.clientKey(value)] = value;
    }

    clientKey(client: IClientApp): string {
        return `${client.appName}_${client.instanceId}`;
    }

    async bulkAdd(): Promise<void> {
        if (
            this &&
            this.seenClients &&
            this.clientAppStore &&
            this.clientInstanceStore
        ) {
            const uniqueRegistrations = Object.values(this.seenClients);
            const uniqueApps = Object.values(
                uniqueRegistrations.reduce((soFar, reg) => {
                    soFar[reg.appName] = reg;
                    return soFar;
                }, {}),
            );
            this.seenClients = {};
            try {
                if (uniqueRegistrations.length > 0) {
                    await this.clientAppStore.bulkUpsert(uniqueApps);
                    await this.clientInstanceStore.bulkUpsert(
                        uniqueRegistrations,
                    );
                }
            } catch (err) {
                this.logger.warn('Failed to register clients', err);
            }
        }
    }

    appToEvent(app: IClientApp): ICreateEvent {
        return {
            type: APPLICATION_CREATED,
            createdBy: app.clientIp,
            data: app,
        };
    }

    getAppsWithToggles(): IClientApp[] {
        const apps = [];
        Object.keys(this.apps).forEach(appName => {
            const seenToggles = Object.keys(this.apps[appName].seenToggles);
            const metricsCount = this.apps[appName].count;
            apps.push({ appName, seenToggles, metricsCount });
        });
        return apps;
    }

    getSeenTogglesByAppName(appName: string): string[] {
        return this.apps[appName]
            ? Object.keys(this.apps[appName].seenToggles)
            : [];
    }

    async getSeenApps(): Promise<Record<string, IApplication[]>> {
        const seenApps = this.getSeenAppsPerToggle();
        const applications: IApplication[] = await this.clientAppStore.getApplications();
        const metaData = applications.reduce((result, entry) => {
            // eslint-disable-next-line no-param-reassign
            result[entry.appName] = entry;
            return result;
        }, {});

        Object.keys(seenApps).forEach(key => {
            seenApps[key] = seenApps[key].map(entry => {
                if (metaData[entry.appName]) {
                    return { ...entry, ...metaData[entry.appName] };
                }
                return entry;
            });
        });
        return seenApps;
    }

    async getApplications(
        query: IApplicationQuery,
    ): Promise<Record<string, IApplication>> {
        return this.clientAppStore.getApplications(query);
    }

    async getApplication(appName: string): Promise<IApplication> {
        const seenToggles = this.getSeenTogglesByAppName(appName);
        const [
            application,
            instances,
            strategies,
            features,
        ] = await Promise.all([
            this.clientAppStore.getApplication(appName),
            this.clientInstanceStore.getByAppName(appName),
            this.strategyStore.getStrategies(),
            this.toggleStore.getFeatures(),
        ]);

        return {
            appName: application.appName,
            createdAt: application.createdAt,
            description: application.description,
            url: application.url,
            color: application.color,
            icon: application.icon,
            strategies: application.strategies.map(name => {
                const found = strategies.find(f => f.name === name);
                return found || { name, notFound: true };
            }),
            instances,
            seenToggles: seenToggles.map(name => {
                const found = features.find(f => f.name === name);
                return found || { name, notFound: true };
            }),
            links: {
                self: `/api/applications/${application.appName}`,
            },
        };
    }

    getSeenAppsPerToggle(): Record<string, IApplication[]> {
        const toggles = {};
        Object.keys(this.apps).forEach(appName => {
            Object.keys(this.apps[appName].seenToggles).forEach(
                seenToggleName => {
                    if (!toggles[seenToggleName]) {
                        toggles[seenToggleName] = [];
                    }
                    toggles[seenToggleName].push({ appName });
                },
            );
        });
        return toggles;
    }

    getTogglesMetrics(): Record<string, Record<string, IYesNoCount>> {
        return {
            lastHour: this.lastHourProjection.getProjection(),
            lastMinute: this.lastMinuteProjection.getProjection(),
        };
    }

    addPayload(data: IClientApp): void {
        const { appName, bucket } = data;
        const app = this.getApp(appName);
        this.addBucket(app, bucket);
    }

    getApp(appName: string): IClientApp {
        this.apps[appName] = this.apps[appName] || {
            seenToggles: {},
            count: 0,
        };
        return this.apps[appName];
    }

    createCountObject(entry: IMetricCounts): IYesNoCount {
        let yes = typeof entry.yes === 'number' ? entry.yes : 0;
        let no = typeof entry.no === 'number' ? entry.no : 0;

        if (entry.variants) {
            Object.entries(entry.variants).forEach(([key, value]) => {
                if (key === 'disabled') {
                    no += value;
                } else {
                    yes += value;
                }
            });
        }

        return { yes, no };
    }

    addBucket(app: IClientApp, bucket: IMetricsBucket): void {
        let count = 0;
        // TODO stop should be createdAt
        const { stop, toggles } = bucket;

        const toggleNames = Object.keys(toggles);

        toggleNames.forEach(n => {
            const countObj = this.createCountObject(toggles[n]);
            this.lastHourProjection.add(n, countObj);
            this.lastMinuteProjection.add(n, countObj);
            count += countObj.yes + countObj.no;
        });

        this.lastHourList.add(toggles, stop);
        this.lastMinuteList.add(toggles, stop);

        this.globalCount += count;
        app.count += count;
        this.addSeenToggles(app, toggleNames);
    }

    addSeenToggles(app: IClientApp, toggleNames: string[]): void {
        toggleNames.forEach(t => {
            app.seenToggles[t] = true;
        });
    }

    async deleteApplication(appName: string): Promise<void> {
        await this.clientInstanceStore.deleteForApplication(appName);
        await this.clientAppStore.deleteApplication(appName);
    }

    async createApplication(input: IApplication): Promise<void> {
        const applicationData = await applicationSchema.validateAsync(input);
        await this.clientAppStore.upsert(applicationData);
    }

    destroy(): void {
        this.lastHourList.destroy();
        this.lastMinuteList.destroy();
        this.timers.forEach(clearInterval);
    }
}
