const Controller = require('../controller');
const { handleErrors } = require('./util');
const { UPDATE_APPLICATION } = require('../../permissions');

class MetricsController extends Controller {
    constructor(config, { clientMetricsService }) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.js');

        this.metrics = clientMetricsService;

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

    async getSeenToggles(req, res) {
        try {
            const seenAppToggles = await this.metrics.getAppsWithToggles();
            res.json(seenAppToggles);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getSeenApps(req, res) {
        try {
            const seenApps = await this.metrics.getSeenApps();
            res.json(seenApps);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureToggles(req, res) {
        try {
            const toggles = await this.metrics.getTogglesMetrics();
            res.json(toggles);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureToggle(req, res) {
        try {
            const { name } = req.params;
            const data = await this.metrics.getTogglesMetrics();
            const lastHour = data.lastHour[name] || {};
            const lastMinute = data.lastMinute[name] || {};
            res.json({
                lastHour,
                lastMinute,
            });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async deleteApplication(req, res) {
        const { appName } = req.params;

        try {
            await this.metrics.deleteApplication(appName);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async createApplication(req, res) {
        const input = { ...req.body, appName: req.params.appName };
        try {
            await this.metrics.createApplication(input);
            res.status(202).end();
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getApplications(req, res) {
        try {
            const applications = await this.metrics.getApplications(req.query);
            res.json({ applications });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getApplication(req, res) {
        const { appName } = req.params;

        try {
            const appDetails = await this.metrics.getApplication(appName);
            res.json(appDetails);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }
}

module.exports = MetricsController;
