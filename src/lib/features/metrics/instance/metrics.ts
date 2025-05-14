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
import { clientMetricsEnvBulkSchema } from '../shared/schema.js';
import type { IClientMetricsEnv } from '../client-metrics/client-metrics-store-v2-type.js';
import { CLIENT_METRICS } from '../../../events/index.js';

export default class ClientMetricsController extends Controller {
    logger: Logger;

    clientInstanceService: ClientInstanceService;

    openApiService: OpenApiService;

    metricsV2: ClientMetricsServiceV2;

    flagResolver: IFlagResolver;

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
