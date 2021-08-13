import { Request, Response } from 'express';
import Controller from '../controller';
import { handleErrors } from '../util';
import { UPDATE_APPLICATION } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Logger } from '../../logger';
import ClientMetricsService from '../../services/client-metrics';

class MetricsController extends Controller {
    private logger: Logger;

    private metrics: ClientMetricsService;

    constructor(
        config: IUnleashConfig,
        {
            clientMetricsService,
        }: Pick<IUnleashServices, 'clientMetricsService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/metrics.ts');

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

    async getSeenToggles(req: Request, res: Response): Promise<void> {
        try {
            const seenAppToggles = await this.metrics.getAppsWithToggles();
            res.json(seenAppToggles);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getSeenApps(req: Request, res: Response): Promise<void> {
        try {
            const seenApps = await this.metrics.getSeenApps();
            res.json(seenApps);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureToggles(req: Request, res: Response): Promise<void> {
        try {
            const toggles = await this.metrics.getTogglesMetrics();
            res.json(toggles);
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getFeatureToggle(req: Request, res: Response): Promise<void> {
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

    async deleteApplication(req: Request, res: Response): Promise<void> {
        const { appName } = req.params;

        try {
            await this.metrics.deleteApplication(appName);
            res.status(200).end();
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async createApplication(req: Request, res: Response): Promise<void> {
        const input = { ...req.body, appName: req.params.appName };
        try {
            await this.metrics.createApplication(input);
            res.status(202).end();
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getApplications(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.strategyName
                ? { strategyName: req.query.strategyName as string }
                : {};
            const applications = await this.metrics.getApplications(query);
            res.json({ applications });
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }

    async getApplication(req: Request, res: Response): Promise<void> {
        const { appName } = req.params;

        try {
            const appDetails = await this.metrics.getApplication(appName);
            res.json(appDetails);
        } catch (err) {
            handleErrors(res, this.logger, err);
        }
    }
}
export default MetricsController;
module.exports = MetricsController;
