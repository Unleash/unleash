/*
 * TODO:
 * After some time it should also remove toggles from application.
 *
 * A simple way to do this is to have a current and prev variable and swtich
 * these once in a while. There is no harm in having unleash lagging some minutes
 * before a new toggle is detected.
 *
 */

module.exports = class ApplicationToggleService {
    constructor (stores, metricService) {
        this.clientInstanceStore = stores.clientInstanceStore;
        this.clientStrategyStore = stores.clientStrategyStore;
        metricService.on('metrics', (metrics) => this.addMetrics(metrics));
        this.applicationToggles = {};
    }

    addMetrics (metrics) {
        metrics.forEach(m => {
            const item = m.metrics;
            const toggles = Object.keys(item.bucket.toggles);
            this.applicationToggles[item.appName] =  this.applicationToggles[item.appName] || {};
            this.applicationToggles[item.appName].toggles = this.applicationToggles[item.appName].toggles || [];
            toggles.forEach((toggle) => {
                if(!this.applicationToggles[item.appName].toggles.includes(toggle)) {
                    this.applicationToggles[item.appName].toggles.push(toggle);
                }
            });

        });
    }

    getAppToggles () {
        return Promise.all([this.clientInstanceStore.getAll(), this.clientStrategyStore.getAll()])
            .then(values => {
                const apps = Object.assign({}, this.applicationToggles);
                console.log(apps);
                values[1].forEach(item => {
                    apps[item.appName] = apps[item.appName] || {};
                    apps[item.appName].strategies = item.strategies;
                });

                values[0].forEach(item => {
                    apps[item.appName] = apps[item.appName] || {};
                    apps[item.appName].instances = apps[item.appName].instances || [];
                    apps[item.appName].instances.push(item.instanceId);
                });

                return apps;
            });
        return this.apps;
    }
}
