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

        // Add a route to get custom metrics (for debugging purposes)
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

        // Add a route to expose metrics in Prometheus format
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

    // Method to retrieve all stored custom metrics
    async getCustomMetrics(req: IAuthRequest, res: Response): Promise<void> {
        try {
            const allMetrics = this.customMetricsService.getMetrics();

            // Return the stored metrics
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

    // Method to retrieve metrics in Prometheus format
    async getPrometheusMetrics(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        try {
            // Get Prometheus formatted metrics from the service
            const output = this.customMetricsService.getPrometheusMetrics();

            // Return Prometheus formatted metrics
            res.set('Content-Type', 'text/plain');
            res.send(output);
        } catch (e) {
            this.logger.error('Error generating Prometheus metrics', e);
            res.status(500).end();
        }
    }
}
