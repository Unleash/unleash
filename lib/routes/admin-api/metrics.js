'use strict';

const Controller = require('../controller');
const logger = require('../../logger')('/admin-api/metrics.js');
const ClientMetrics = require('../../client-metrics');

class MetricsController extends Controller {
    constructor({
        clientMetricsStore,
        clientInstanceStore,
        clientApplicationsStore,
        strategyStore,
        featureToggleStore,
    }) {
        super();
        this.metrics = new ClientMetrics(clientMetricsStore);
        this.clientInstanceStore = clientInstanceStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;

        this.get('/seen-toggles', this.getSeenToggles);
        this.get('/seen-apps', this.getSeenApps);
        this.get('/feature-toggles', this.getFeatureToggles);
        this.get('/feature-toggles/:name', this.getFeatureToggle);
        this.post('/applications/:appName', this.createApplication);
        this.get('/applications/', this.getApplications);
        this.get('/applications/:appName', this.getApplication);
    }

    getSeenToggles(req, res) {
        const seenAppToggles = this.metrics.getAppsWithToggles();
        res.json(seenAppToggles);
    }

    async getSeenApps(req, res) {
        const seenApps = this.metrics.getSeenAppsPerToggle();
        const applications = await this.clientApplicationsStore.getApplications();
        const metaData = applications.reduce((result, entry) => {
            result[entry.appName] = entry;
            return result;
        }, {});

        Object.keys(seenApps).forEach(key => {
            seenApps[key] = seenApps[key].map(entry => {
                if (metaData[entry.appName]) {
                    return Object.assign({}, entry, metaData[entry.appName]);
                }
                return entry;
            });
        });
        res.json(seenApps);
    }

    getFeatureToggles(req, res) {
        res.json(this.metrics.getTogglesMetrics());
    }

    getFeatureToggle(req, res) {
        const name = req.params.name;
        const data = this.metrics.getTogglesMetrics();
        const lastHour = data.lastHour[name] || {};
        const lastMinute = data.lastMinute[name] || {};
        res.json({
            lastHour,
            lastMinute,
        });
    }

    // Todo: add joi-schema validation
    async createApplication(req, res) {
        const input = Object.assign({}, req.body, {
            appName: req.params.appName,
        });

        try {
            await this.clientApplicationsStore.upsert(input);
            res.status(202).end();
        } catch (err) {
            logger.error(err);
            res.status(500).end();
        }
    }

    async getApplications(req, res) {
        try {
            const applications = await this.clientApplicationsStore.getApplications(
                req.query
            );
            res.json({ applications });
        } catch (err) {
            logger.error(err);
            res.status(500).end();
        }
    }

    async getApplication(req, res) {
        const appName = req.params.appName;
        const seenToggles = this.metrics.getSeenTogglesByAppName(appName);

        try {
            const [
                application,
                instances,
                strategies,
                features,
            ] = await Promise.all([
                this.clientApplicationsStore.getApplication(appName),
                this.clientInstanceStore.getByAppName(appName),
                this.strategyStore.getStrategies(),
                this.featureToggleStore.getFeatures(),
            ]);

            const appDetails = {
                appName: application.appName,
                createdAt: application.createdAt,
                description: application.description,
                url: application.url,
                color: application.color,
                icon: application.icon,
                strategies: application.strategies.map(name => {
                    const found = strategies.find(f => f.name === name);
                    return found ? found : { name, notFound: true };
                }),
                instances,
                seenToggles: seenToggles.map(name => {
                    const found = features.find(f => f.name === name);
                    return found ? found : { name, notFound: true };
                }),
                links: {
                    self: `/api/applications/${application.appName}`,
                },
            };
            res.json(appDetails);
        } catch (err) {
            logger.error(err);
            res.status(500).end();
        }
    }
}

module.exports = MetricsController;
