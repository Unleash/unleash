'use strict';

module.exports = class UnleashClientMetrics {
    constructor () {
        this.globalCount = 0;
        this.apps = [];
        this.clients = {};
        this.strategies = {};
        this.store = {};
    }

    toJSON () {
        return JSON.stringify(this.getState(), null, 4);
    }

    getState () {
        // TODO this payload will be WAY to big, need to flatten the store
        // and possibly evict/flag stale clients
        return {
            globalCount: this.globalCount,
            apps: this.apps,
            clients: this.clients,
            strategies: this.strategies,
            store: this.store,
        };
    }

    addPayload (data) {
        this.addApp(data.appName);
        this.addClient(data.appName, data.instanceId, data.clientInitTime);
        this.addStrategies(data.appName, data.strategies);
        this.addStore(data.appName, data.instanceId, data.store);
    }

    addStore (appName, instanceId, instanceStore) {
        // TODO normalize time client-server-time / NTP?
        const normalizeTimeEntries = (entry) => Object.assign({ appName, instanceId }, entry);
        let count = 0;

        Object.keys(instanceStore).forEach((n) => {
            if (n.startsWith('_')) {
                return;
            }
            if (this.store[n]) {
                this.store[n].yes = this.store[n].yes.concat(instanceStore[n].yes.map(normalizeTimeEntries));
                this.store[n].no = this.store[n].no.concat(instanceStore[n].no.map(normalizeTimeEntries));
            } else {
                this.store[n] = {
                    yes: instanceStore[n].yes.map(normalizeTimeEntries),
                    no: instanceStore[n].no.map(normalizeTimeEntries),
                };
            }
            count += (instanceStore[n].yes.length + instanceStore[n].no.length);
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

    addClient (appName, instanceId, clientInitTime) {
        if (instanceId) {
            if (this.clients[instanceId]) {
                this.clients[instanceId].ping = new Date();
            } else {
                this.clients[instanceId] = {
                    appName,
                    count: 0,
                    clientInit: clientInitTime,
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
