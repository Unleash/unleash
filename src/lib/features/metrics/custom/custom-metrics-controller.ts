import type { Response } from 'express';
import Controller from '../../../routes/controller.js';
import type { IUnleashConfig } from '../../../types/index.js';
import type { Logger } from '../../../logger.js';
import type { IAuthRequest } from '../../../routes/unleash-types.js';
import { NONE } from '../../../types/permissions.js';
import type {
    IUnleashServices,
    OpenApiService,
} from '../../../services/index.js';
import { emptyResponse } from '../../../openapi/util/standard-responses.js';
import type { CustomMetricsService } from './custom-metrics-service.js';

export default class CustomMetricsController extends Controller {
    logger: Logger;
    openApiService: OpenApiService;
    customMetricsService: CustomMetricsService;

    constructor(
        {
            customMetricsService,
            openApiService,
        }: Pick<IUnleashServices, 'customMetricsService' | 'openApiService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        const { getLogger } = config;

        this.logger = getLogger('/admin-api/custom-metrics');
        this.openApiService = openApiService;
        this.customMetricsService = customMetricsService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getCustomMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Metrics'],
                    summary: 'Get stored custom metrics',
                    description: `Retrieves the stored custom metrics data.`,
                    operationId: 'getCustomMetrics',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/prometheus',
            handler: this.getPrometheusMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Metrics'],
                    summary: 'Get metrics in Prometheus format',
                    description: `Exposes all custom metrics in Prometheus text format for scraping.`,
                    operationId: 'getPrometheusMetrics',
                    responses: {
                        200: {
                            description: 'Prometheus formatted metrics',
                            content: {
                                'text/plain': {
                                    schema: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                }),
            ],
        });
    }

    async getCustomMetrics(_req: IAuthRequest, res: Response): Promise<void> {
        try {
            const allMetrics = this.customMetricsService.getMetrics();

            res.json({
                metrics: allMetrics,
                count: allMetrics.length,
                metricNames: this.customMetricsService.getMetricNames(),
            });
        } catch (e) {
            this.logger.error('Error retrieving custom metrics', e);
            res.status(500).end();
        }
    }

    async getPrometheusMetrics(
        _req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        try {
            const output = this.customMetricsService.getPrometheusMetrics();

            res.set('Content-Type', 'text/plain');
            res.send(output);
        } catch (e) {
            this.logger.error('Error generating Prometheus metrics', e);
            res.status(500).end();
        }
    }
}
