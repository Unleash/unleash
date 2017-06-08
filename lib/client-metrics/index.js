'use strict';

const Projection = require('./projection.js');
const TTLList = require('./ttl-list.js');

module.exports = class UnleashClientMetrics {
    constructor (clientMetricsStore) {
        this.globalCount = 0;
        this.apps = {};

        this.lastDayProjection = new Projection();
        this.lastHourProjection = new Projection();
        this.lastMinuteProjection = new Projection();

        this.lastDayList = new TTLList({
            interval: 30 * 60 * 1000,
            expireType: 'hours',
            expireAmount: 24,
        });

        this.startLastDayCollection();

        this.lastHourList = new TTLList({
            interval: 10000,
        });

        this.lastMinuteList = new TTLList({
            interval: 10000,
            expireType: 'minutes',
            expireAmount: 1,
        });

        this.lastDayList.on('expire', (toggles) => {
            Object.keys(toggles).forEach(toggleName => {
                this.lastDayProjection.substract(toggleName, toggles[toggleName]);
            });
        });

        this.lastHourList.on('expire', (toggles) => {
            Object.keys(toggles).forEach(toggleName => {
                this.lastHourProjection.substract(toggleName, toggles[toggleName]);
            });
        });
        this.lastMinuteList.on('expire', (toggles) => {
            Object.keys(toggles).forEach(toggleName => {
                this.lastMinuteProjection.substract(toggleName, toggles[toggleName]);
            });
        });
        clientMetricsStore.on('metrics', (m) => this.addPayload(m));
    }

    startLastDayCollection () {
        const collect = () => {
            const data = this.lastHourProjection.getProjection();
            this.lastDayList.add(data);
            Object.keys(data).forEach(toggleName => {
                this.lastDayProjection.add(toggleName, data[toggleName]);
            });
        };

        this.lastDayTimer = setInterval(() => {
            collect();
        }, 60 * 60 * 1000);

        // lets copy initial data may have been populated from persisted store on boot
        // this will give a fake number
        setTimeout(() => {
            collect();
        }, 5 * 1000);
    }

    getAppsWithToggles () {
        const apps = [];
        Object.keys(this.apps).forEach(appName => {
            const seenToggles = Object.keys(this.apps[appName].seenToggles);
            const metricsCount = this.apps[appName].count;
            apps.push({ appName, seenToggles, metricsCount });
        });
        return apps;
    }

    getSeenTogglesByAppName (appName) {
        return this.apps[appName] ? Object.keys(this.apps[appName].seenToggles) : [];
    }

    getSeenAppsPerToggle () {
        const toggles = {};
        Object.keys(this.apps).forEach(appName => {
            Object.keys(this.apps[appName].seenToggles).forEach((seenToggleName) => {
                if (!toggles[seenToggleName]) {
                    toggles[seenToggleName] = [];
                }
                toggles[seenToggleName].push({ appName });
            });
        });
        return toggles;
    }

    copyCounts (lastHour, lastDay) {
        const result = {};
        Object.keys(lastHour).forEach((key) => {
            result[key] = {
                yes: lastHour[key].yes,
                no: lastHour[key].no,
            };
        });
        Object.keys(lastDay).forEach((key) => {
            if (!result[key]) {
                result[key] = { yes: 0, no: 0 };
            }
            result[key].yes += lastDay[key].yes;
            result[key].no += lastDay[key].no;
        });
        return result;
    }

    getTogglesMetrics () {
        const lastHour = this.lastHourProjection.getProjection();
        const lastDay = this.lastDayProjection.getProjection();

        return {
            lastDay: this.copyCounts(lastHour, lastDay),
            lastHour,
            lastMinute: this.lastMinuteProjection.getProjection(),
        };
    }

    addPayload (data) {
        const { appName, bucket } = data;
        const app = this.getApp(appName);
        this.addBucket(app, bucket);
    }

    getApp (appName) {
        this.apps[appName] = this.apps[appName] || { seenToggles: {}, count: 0 };
        return this.apps[appName];
    }

    addBucket (app, bucket) {
        let count = 0;
        // TODO stop should be createdAt
        const { stop, toggles } = bucket;

        const toggleNames = Object.keys(toggles);

        toggleNames.forEach((n) => {
            const entry = toggles[n];
            this.lastHourProjection.add(n, entry);
            this.lastMinuteProjection.add(n, entry);
            count += (entry.yes + entry.no);
        });

        this.lastHourList.add(toggles, stop);
        this.lastMinuteList.add(toggles, stop);

        this.globalCount += count;
        app.count += count;
        this.addSeenToggles(app, toggleNames);
    }

    addSeenToggles (app, toggleNames) {
        toggleNames.forEach(t => {
            app.seenToggles[t] = true;
        });
    }

    destroy () {
        clearInterval(this.lastDayTimer);
        this.lastDayList.destroy();
        this.lastHourList.destroy();
        this.lastMinuteList.destroy();
    }
};
