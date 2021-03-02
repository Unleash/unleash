/* eslint-disable no-param-reassign */

'use strict';

const Projection = require('./projection.js');
const TTLList = require('./ttl-list.js');
const appSchema = require('./metrics-schema');
const NotFoundError = require('../../error/notfound-error');
const { clientMetricsSchema } = require('./client-metrics-schema');
const { clientRegisterSchema } = require('./register-schema');
const { APPLICATION_CREATED } = require('../../event-type');

module.exports = class ClientMetricsService {
    constructor(
        {
            clientMetricsStore,
            strategyStore,
            featureToggleStore,
            clientApplicationsStore,
            clientInstanceStore,
            eventStore,
        },
        { getLogger },
    ) {
        this.globalCount = 0;
        this.apps = {};
        this.strategyStore = strategyStore;
        this.toggleStore = featureToggleStore;
        this.clientAppStore = clientApplicationsStore;
        this.clientInstanceStore = clientInstanceStore;
        this.clientMetricsStore = clientMetricsStore;
        this.lastHourProjection = new Projection();
        this.lastMinuteProjection = new Projection();
        this.eventStore = eventStore;

        this.lastHourList = new TTLList({
            interval: 10000,
        });
        this.logger = getLogger('services/client-metrics/index.js');

        this.lastMinuteList = new TTLList({
            interval: 10000,
            expireType: 'minutes',
            expireAmount: 1,
        });

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
        this.seenClients = {};
        this.registerBulkAddInterval();
        clientMetricsStore.on('metrics', m => this.addPayload(m));
    }

    registerBulkAddInterval() {
        setInterval(() => this.bulkAdd(this), 5000);
    }

    async registerClientMetrics(data, clientIp) {
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

    async upsertApp(value, clientIp) {
        try {
            const app = await this.clientAppStore.getApplication(value.appName);
            await this.updateRow(value, app);
        } catch (error) {
            if (error instanceof NotFoundError) {
                await this.clientAppStore.insertNewRow(value);
                await this.eventStore.store({
                    type: APPLICATION_CREATED,
                    createdBy: clientIp,
                    data: value,
                });
            }
        }
    }

    async registerClient(data, clientIp) {
        const value = await clientRegisterSchema.validateAsync(data);
        value.clientIp = clientIp;
        this.seenClients[this.clientKey(value)] = value;
    }

    clientKey(client) {
        return `${client.appName}_${client.instanceId}`;
    }

    async bulkAdd() {
        if (
            this &&
            this.seenClients &&
            this.clientAppStore &&
            this.clientInstanceStore
        ) {
            const uniqueRegistrations = Object.values(this.seenClients);
            this.seenClients = {};
            await this.clientAppStore.updateRows(uniqueRegistrations);
            await this.clientInstanceStore.bulkInsert(uniqueRegistrations);
        }
    }

    getAppsWithToggles() {
        const apps = [];
        Object.keys(this.apps).forEach(appName => {
            const seenToggles = Object.keys(this.apps[appName].seenToggles);
            const metricsCount = this.apps[appName].count;
            apps.push({ appName, seenToggles, metricsCount });
        });
        return apps;
    }

    getSeenTogglesByAppName(appName) {
        return this.apps[appName]
            ? Object.keys(this.apps[appName].seenToggles)
            : [];
    }

    async getSeenApps() {
        const seenApps = this.getSeenAppsPerToggle();
        const applications = await this.clientAppStore.getApplications();
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

    async getApplications(query) {
        return this.clientAppStore.getApplications(query);
    }

    async getApplication(appName) {
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

    getSeenAppsPerToggle() {
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

    getTogglesMetrics() {
        return {
            lastHour: this.lastHourProjection.getProjection(),
            lastMinute: this.lastMinuteProjection.getProjection(),
        };
    }

    addPayload(data) {
        const { appName, bucket } = data;
        const app = this.getApp(appName);
        this.addBucket(app, bucket);
    }

    getApp(appName) {
        this.apps[appName] = this.apps[appName] || {
            seenToggles: {},
            count: 0,
        };
        return this.apps[appName];
    }

    createCountObject(entry) {
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

    addBucket(app, bucket) {
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

    addSeenToggles(app, toggleNames) {
        toggleNames.forEach(t => {
            app.seenToggles[t] = true;
        });
    }

    async deleteApplication(appName) {
        await this.clientInstanceStore.deleteForApplication(appName);
        await this.clientAppStore.deleteApplication(appName);
    }

    async createApplication(input) {
        const applicationData = await appSchema.validateAsync(input);
        await this.clientAppStore.upsert(applicationData);
    }

    destroy() {
        this.lastHourList.destroy();
        this.lastMinuteList.destroy();
    }
};
