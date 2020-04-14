/* eslint-disable no-param-reassign */

'use strict';

const Projection = require('./projection.js');
const TTLList = require('./ttl-list.js');

module.exports = class UnleashClientMetrics {
    constructor(clientMetricsStore) {
        this.globalCount = 0;
        this.apps = {};

        this.lastHourProjection = new Projection();
        this.lastMinuteProjection = new Projection();

        this.lastHourList = new TTLList({
            interval: 10000,
        });

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
        clientMetricsStore.on('metrics', m => this.addPayload(m));
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

    destroy() {
        this.lastHourList.destroy();
        this.lastMinuteList.destroy();
    }
};
