'use strict';

const Controller = require('../controller');
const ClientMetrics = require('../../client-metrics');
const schema = require('./metrics-schema');
const { UPDATE_APPLICATION } = require('../../permissions');

class MetricsController extends Controller {
    constructor(config) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.js');
        const {
            clientMetricsStore,
            clientInstanceStore,
            clientApplicationsStore,
            strategyStore,
            featureToggleStore,
        } = config.stores;

        this.metrics = new ClientMetrics(clientMetricsStore);
        this.clientInstanceStore = clientInstanceStore;
        this.clientApplicationsStore = clientApplicationsStore;
        this.strategyStore = strategyStore;
        this.featureToggleStore = featureToggleStore;

        this.get('/seen-toggles', this.getSeenToggles);
        this.get('/seen-apps', this.getSeenApps);
        this.get('/feature-toggles', this.getFeatureToggles);
        this.get('/feature-toggles/:name', this.getFeatureToggle);
        this.post(
            '/applications/:appName',
            this.createApplication,
            UPDATE_APPLICATION,
        );
        this.delete(
            '/applications/:appName',
            this.deleteApplication,
            UPDATE_APPLICATION,
        );
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
        res.json(seenApps);
    }

    getFeatureToggles(req, res) {
        res.json(this.metrics.getTogglesMetrics());
    }

    getFeatureToggle(req, res) {
        const { name } = req.params;
        const data = this.metrics.getTogglesMetrics();
        const lastHour = data.lastHour[name] || {};
        const lastMinute = data.lastMinute[name] || {};
        res.json({
            lastHour,
            lastMinute,
        });
    }

    async deleteApplication(req, res) {
        const { appName } = req.params;
        try {
            await this.clientInstanceStore.deleteForApplication(appName);
            await this.clientApplicationsStore.deleteApplication(appName);
            res.status(200).end();
        } catch (e) {
            this.logger.error(e);
            res.status(500).end();
        }
    }

    async createApplication(req, res) {
        const input = { ...req.body, appName: req.params.appName };
        const { value: applicationData, error } = schema.validate(input);

        if (error) {
            this.logger.warn('Invalid application data posted', error);
            return res.status(400).json(error);
        }

        try {
            await this.clientApplicationsStore.upsert(applicationData);
            return res.status(202).end();
        } catch (err) {
            this.logger.error(err);
            return res.status(500).end();
        }
    }

    async getApplications(req, res) {
        try {
            const applications = await this.clientApplicationsStore.getApplications(
                req.query,
            );
            res.json({ applications });
        } catch (err) {
            this.logger.error(err);
            res.status(500).end();
        }
    }

    async getApplication(req, res) {
        const { appName } = req.params;
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
            res.json(appDetails);
        } catch (err) {
            this.logger.error(err);
            res.status(500).end();
        }
    }
}

module.exports = MetricsController;
