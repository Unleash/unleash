'use strict';

const Projection = require('./projection.js');
const TTLList = require('./ttl-list.js');
const moment = require('moment');

module.exports = class UnleashClientMetrics {
    constructor () {
        this.globalCount = 0;
        this.apps = {};
        this.clients = {};
        this.buckets = {};

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
    }

    toJSON () {
        return JSON.stringify(this.getMetricsOverview(), null, 4);
    }

    getMetricsOverview () {
        return {
            globalCount: this.globalCount,
            apps: this.apps,
            clients: this.clients,
        };
    }

    getTogglesMetrics () {
        return {
            lastHour: this.lastHourProjection.getProjection(),
            lastMinute: this.lastMinuteProjection.getProjection(),
        };
    }

    addPayload (data) {
        this.addClient(data.appName, data.instanceId);
        this.addBucket(data.appName, data.instanceId, data.bucket);
    }

    addBucket (appName, instanceId, bucket) {
        let count = 0;
        // TODO stop should be createdAt
        const { stop, toggles } = bucket;

        Object.keys(toggles).forEach((n) => {
            const entry = toggles[n];
            this.lastHourProjection.add(n, entry);
            this.lastMinuteProjection.add(n, entry);
            count += (entry.yes + entry.no);
        });

        this.lastHourList.add(toggles, stop);
        this.lastMinuteList.add(toggles, stop);

        this.addClientCount(appName, instanceId, count);
    }

    addClientCount (appName, instanceId, count) {
        if (typeof count === 'number' && count > 0) {
            this.globalCount += count;
            if (this.clients[instanceId]) {
                this.clients[instanceId].count += count;
            }
        }
    }

    addClient (appName, instanceId, started = new Date()) {
        this.addApp(appName, instanceId);
        if (instanceId) {
            if (this.clients[instanceId]) {
                this.clients[instanceId].ping = new Date();
            } else {
                this.clients[instanceId] = {
                    appName,
                    count: 0,
                    started,
                    init: new Date(),
                    ping: new Date(),
                };
            }
        }
    }

    addApp (appName, instanceId) {
        if (appName && !this.apps[appName]) {
            this.apps[appName] = {
                count: 0,
                clients: [],
            };
        }

        if (instanceId && !this.apps[appName].clients.includes(instanceId)) {
            this.apps[appName].clients.push(instanceId);
        }
    }
};
