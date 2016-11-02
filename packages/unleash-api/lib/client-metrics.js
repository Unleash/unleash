'use strict';

module.exports = class UnleashClientMetrics {
    constructor () {
        this.globalCount = 0;
        this.apps = [];
        this.clients = {};
        this.strategies = {};
        this.buckets = {};
    }

    toJSON () {
        return JSON.stringify(this.getState(), null, 4);
    }

    getState () {
        // TODO need to flatten the store / possibly evict/flag stale clients
        return {
            globalCount: this.globalCount,
            apps: this.apps,
            clients: this.clients,
            strategies: this.strategies,
            buckets: this.buckets,
        };
    }

    registerClient (data) {
        this.addClient(data.appName, data.instanceId, data.started);
        this.addStrategies(data.appName, data.strategies);
    }

    addPayload (data) {
        this.addClient(data.appName, data.instanceId);
        this.addBucket(data.appName, data.instanceId, data.bucket);
    }

    addBucket (appName, instanceId, bucket) {
        // TODO normalize time client-server-time / NTP?
        let count = 0;
        const { start, stop, toggles } = bucket;
        Object.keys(toggles).forEach((n) => {
            if (this.buckets[n]) {
                this.buckets[n].yes.push({ start, stop, count: toggles[n].yes });
                this.buckets[n].no.push({ start, stop, count: toggles[n].no });
            } else {
                this.buckets[n] = {
                    yes: [{ start, stop, count: toggles[n].yes }],
                    no: [{ start, stop, count: toggles[n].no }],
                };
            }

            count += (toggles[n].yes + toggles[n].no);
        });
        this.addClientCount(instanceId, count);
    }

    addStrategies (appName, strategyNames) {
        strategyNames.forEach((name) => {
            if (!this.strategies[name]) {
                this.strategies[name] = {};
            }
            this.strategies[name][appName] = true;
        });
    }

    addClientCount (instanceId, count) {
        if (typeof count === 'number' && count > 0) {
            this.globalCount += count;
            if (this.clients[instanceId]) {
                this.clients[instanceId].count += count;
            }
        }
    }

    addClient (appName, instanceId, started = new Date()) {
        this.addApp(appName);
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

    addApp (v) {
        if (v && !this.apps.includes(v)) {
            this.apps.push(v);
        }
    }
};
