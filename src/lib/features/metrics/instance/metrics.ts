import type { Response } from 'express';
import Controller from '../../../routes/controller.js';
import type { IFlagResolver, IUnleashConfig } from '../../../types/index.js';
import type ClientInstanceService from './instance-service.js';
import type { Logger } from '../../../logger.js';
import type { IAuthRequest } from '../../../routes/unleash-types.js';
import type ClientMetricsServiceV2 from '../client-metrics/metrics-service-v2.js';
import { NONE } from '../../../types/permissions.js';
import type {
    IUnleashServices,
    OpenApiService,
} from '../../../services/index.js';
import { createRequestSchema } from '../../../openapi/util/create-request-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses.js';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import type { BulkMetricsSchema } from '../../../openapi/spec/bulk-metrics-schema.js';
import {
    clientMetricsEnvBulkSchema,
    customMetricsSchema,
} from '../shared/schema.js';
import type { IClientMetricsEnv } from '../client-metrics/client-metrics-store-v2-type.js';
import { CLIENT_METRICS } from '../../../events/index.js';
import type { CustomMetricsSchema } from '../../../openapi/spec/custom-metrics-schema.js';

// Interface for stored custom metrics
interface StoredCustomMetric {
    name: string;
    value: number;
    labels?: Record<string, string>;
    timestamp: Date;
}

export default class ClientMetricsController extends Controller {
    logger: Logger;

    clientInstanceService: ClientInstanceService;

    openApiService: OpenApiService;

    metricsV2: ClientMetricsServiceV2;

    flagResolver: IFlagResolver;

    // In-memory store for custom metrics organized by metric name
    private customMetricsStore: Map<string, StoredCustomMetric[]> = new Map();

    constructor(
        {
            clientInstanceService,
            clientMetricsServiceV2,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'clientInstanceService'
            | 'clientMetricsServiceV2'
            | 'openApiService'
        >,
        config: IUnleashConfig,
    ) {
        super(config);
        const { getLogger } = config;

        this.logger = getLogger('/api/client/metrics');
        this.clientInstanceService = clientInstanceService;
        this.openApiService = openApiService;
        this.metricsV2 = clientMetricsServiceV2;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'post',
            path: '',
            handler: this.registerMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Client'],
                    summary: 'Register client usage metrics',
                    description: `Registers usage metrics. Stores information about how many times each flag was evaluated to enabled and disabled within a time frame. If provided, this operation will also store data on how many times each feature flag's variants were displayed to the end user.`,
                    operationId: 'registerClientMetrics',
                    requestBody: createRequestSchema('clientMetricsSchema'),
                    responses: {
                        ...getStandardResponses(400),
                        202: emptyResponse,
                        204: emptyResponse,
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.metricsRateLimiting.clientMetricsMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/bulk',
            handler: this.bulkMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Edge'],
                    summary: 'Send metrics in bulk',
                    description: `This operation accepts batched metrics from any client. Metrics will be inserted into Unleash's metrics storage`,
                    operationId: 'clientBulkMetrics',
                    requestBody: createRequestSchema('bulkMetricsSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400, 413, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/custom',
            handler: this.customMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Client'],
                    summary: 'Send custom metrics',
                    description: `This operation accepts custom metrics from clients. These metrics will be exposed via Prometheus in Unleash.`,
                    operationId: 'clientCustomMetrics',
                    requestBody: createRequestSchema('customMetricsSchema'),
                    responses: {
                        202: emptyResponse,
                        ...getStandardResponses(400),
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.metricsRateLimiting.clientMetricsMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });

        // Add a route to get custom metrics (for debugging purposes)
        this.route({
            method: 'get',
            path: '/custom',
            handler: this.getCustomMetrics,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Client'],
                    summary: 'Get stored custom metrics',
                    description: `Retrieves the stored custom metrics data.`,
                    operationId: 'getCustomMetrics',
                    responses: {
                        200: emptyResponse,
                    },
                }),
            ],
        });

        // Add a route to get metrics by name
        this.route({
            method: 'get',
            path: '/custom/:name',
            handler: this.getCustomMetricsByName,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Client'],
                    summary: 'Get stored custom metrics by name',
                    description: `Retrieves the stored custom metrics data for a specific metric name.`,
                    operationId: 'getCustomMetricsByName',
                    responses: {
                        200: emptyResponse,
                        404: emptyResponse,
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
                    tags: ['Client'],
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

    async registerMetrics(req: IAuthRequest, res: Response): Promise<void> {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.status(204).end();
        } else {
            try {
                const { body: data, ip: clientIp, user } = req;
                data.environment = this.metricsV2.resolveMetricsEnvironment(
                    user,
                    data,
                );
                await this.clientInstanceService.registerInstance(
                    data,
                    clientIp,
                );

                await this.metricsV2.registerClientMetrics(data, clientIp);
                res.getHeaderNames().forEach((header) =>
                    res.removeHeader(header),
                );
                res.status(202).end();
            } catch (e) {
                res.status(400).end();
            }
        }
    }

    async customMetrics(
        req: IAuthRequest<void, void, CustomMetricsSchema>,
        res: Response<void>,
    ): Promise<void> {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.status(204).end();
        } else {
            try {
                const { body } = req;

                // Use Joi validation for custom metrics
                await customMetricsSchema.validateAsync(body);

                // Process and store custom metrics
                if (body.metrics && Array.isArray(body.metrics)) {
                    const timestamp = new Date();
                    let storedCount = 0;

                    // Store each metric in our in-memory store
                    body.metrics.forEach((metric) => {
                        // Validate types explicitly
                        if (
                            typeof metric.name === 'string' &&
                            typeof metric.value === 'number'
                        ) {
                            const storedMetric: StoredCustomMetric = {
                                name: metric.name,
                                value: metric.value,
                                labels: metric.labels as
                                    | Record<string, string>
                                    | undefined,
                                timestamp,
                            };

                            // Get or create array for this metric name
                            if (!this.customMetricsStore.has(metric.name)) {
                                this.customMetricsStore.set(metric.name, []);
                            }

                            // Add the metric to the array for this name
                            this.customMetricsStore
                                .get(metric.name)
                                ?.push(storedMetric);
                            storedCount++;
                        } else {
                            this.logger.warn(
                                'Invalid metric type found, skipping',
                                metric,
                            );
                        }
                    });

                    this.logger.debug(`Stored ${storedCount} custom metrics`);
                }

                res.status(202).end();
            } catch (e) {
                this.logger.error('Failed to process custom metrics', e);
                res.status(400).end();
            }
        }
    }

    // Method to retrieve all stored custom metrics
    async getCustomMetrics(req: IAuthRequest, res: Response): Promise<void> {
        try {
            const allMetrics: StoredCustomMetric[] = [];
            let totalCount = 0;

            // Flatten the map into a single array
            for (const metricsArray of this.customMetricsStore.values()) {
                allMetrics.push(...metricsArray);
                totalCount += metricsArray.length;
            }

            // Return the stored metrics
            res.json({
                metrics: allMetrics,
                count: totalCount,
                metricNames: Array.from(this.customMetricsStore.keys()),
            });
        } catch (e) {
            this.logger.error('Error retrieving custom metrics', e);
            res.status(500).end();
        }
    }

    // Method to retrieve metrics by name
    async getCustomMetricsByName(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        try {
            const { name } = req.params;

            if (!name || !this.customMetricsStore.has(name)) {
                res.status(404).json({
                    error: `No metrics found with name: ${name}`,
                });
                return;
            }

            const metrics = this.customMetricsStore.get(name) || [];

            res.json({
                name,
                metrics,
                count: metrics.length,
            });
        } catch (e) {
            this.logger.error('Error retrieving metrics by name', e);
            res.status(500).end();
        }
    }

    // Method to retrieve metrics in Prometheus format
    async getPrometheusMetrics(
        req: IAuthRequest,
        res: Response,
    ): Promise<void> {
        try {
            // Prometheus formatted output
            let output = '';

            // Process each metric name
            for (const [
                metricName,
                metrics,
            ] of this.customMetricsStore.entries()) {
                if (metrics.length === 0) continue;

                // Add metric help and type comments
                output += `# HELP ${metricName} Custom metric reported to Unleash\n`;
                output += `# TYPE ${metricName} counter\n`;

                // Add each metric instance
                for (const metric of metrics) {
                    // Format labels if present
                    let labelStr = '';
                    if (
                        metric.labels &&
                        Object.keys(metric.labels).length > 0
                    ) {
                        const labelParts = Object.entries(metric.labels)
                            .map(
                                ([key, value]) =>
                                    `${key}="${this.escapePrometheusString(value)}"`,
                            )
                            .join(',');
                        labelStr = `{${labelParts}}`;
                    }

                    // Add the metric line
                    output += `${metricName}${labelStr} ${metric.value}\n`;
                }

                // Add empty line between different metrics
                output += '\n';
            }

            // Return Prometheus formatted metrics
            res.set('Content-Type', 'text/plain');
            res.send(output);
        } catch (e) {
            this.logger.error('Error generating Prometheus metrics', e);
            res.status(500).end();
        }
    }

    // Helper method to escape special characters in Prometheus label values
    private escapePrometheusString(str: string): string {
        return str
            .replace(/\\/g, '\\\\') // Escape backslashes
            .replace(/"/g, '\\"') // Escape double quotes
            .replace(/\n/g, '\\n'); // Escape newlines
    }

    // Method to clear metrics older than the specified time (in ms)
    clearOldMetrics(maxAge: number): void {
        const now = new Date();

        // For each metric name in the store
        for (const [name, metrics] of this.customMetricsStore.entries()) {
            // Filter out old metrics
            const filteredMetrics = metrics.filter((metric) => {
                const age = now.getTime() - metric.timestamp.getTime();
                return age <= maxAge;
            });

            // Update the store with filtered metrics
            if (filteredMetrics.length === 0) {
                // Remove the entry completely if no metrics remain
                this.customMetricsStore.delete(name);
            } else {
                this.customMetricsStore.set(name, filteredMetrics);
            }
        }

        // Count total metrics after cleanup
        let totalMetrics = 0;
        for (const metrics of this.customMetricsStore.values()) {
            totalMetrics += metrics.length;
        }

        this.logger.debug(
            `Cleared old metrics. Store now contains ${totalMetrics} metrics across ${this.customMetricsStore.size} different metric names`,
        );
    }

    async bulkMetrics(
        req: IAuthRequest<void, void, BulkMetricsSchema>,
        res: Response<void>,
    ): Promise<void> {
        if (this.config.flagResolver.isEnabled('disableMetrics')) {
            res.status(204).end();
        } else {
            const { body, ip: clientIp } = req;
            const { metrics, applications } = body;
            try {
                const promises: Promise<void>[] = [];
                for (const app of applications) {
                    if (
                        app.sdkType === 'frontend' &&
                        typeof app.sdkVersion === 'string'
                    ) {
                        if (
                            this.flagResolver.isEnabled(
                                'registerFrontendClient',
                            )
                        ) {
                            this.clientInstanceService.registerFrontendClient({
                                appName: app.appName,
                                instanceId: app.instanceId,
                                environment: app.environment,
                                sdkType: app.sdkType,
                                sdkVersion: app.sdkVersion,
                                projects: app.projects,
                            });
                        }
                    } else {
                        promises.push(
                            this.clientInstanceService.registerBackendClient(
                                app,
                                clientIp,
                            ),
                        );
                    }
                }
                if (metrics && metrics.length > 0) {
                    const data: IClientMetricsEnv[] =
                        await clientMetricsEnvBulkSchema.validateAsync(metrics);
                    const { user } = req;
                    const acceptedEnvironment =
                        this.metricsV2.resolveUserEnvironment(user);
                    const filteredData = data.filter(
                        (metric) => metric.environment === acceptedEnvironment,
                    );
                    promises.push(
                        this.metricsV2.registerBulkMetrics(filteredData),
                    );
                    this.config.eventBus.emit(CLIENT_METRICS, data);
                }
                await Promise.all(promises);

                res.status(202).end();
            } catch (e) {
                res.status(400).end();
            }
        }
    }
}
