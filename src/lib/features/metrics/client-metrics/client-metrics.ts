import type { Request, Response } from 'express';
import Controller from '../../../routes/controller';
import type { IUnleashConfig } from '../../../types/option';
import type { IFlagResolver, IUnleashServices } from '../../../types';
import type { Logger } from '../../../logger';
import type ClientMetricsServiceV2 from './metrics-service-v2';
import { NONE } from '../../../types/permissions';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import type { OpenApiService } from '../../../services/openapi-service';
import { serializeDates } from '../../../types/serialize-dates';
import {
    type FeatureUsageSchema,
    featureUsageSchema,
} from '../../../openapi/spec/feature-usage-schema';
import {
    featureMetricsSchema,
    type FeatureMetricsSchema,
} from '../../../openapi/spec/feature-metrics-schema';
import { getStandardResponses } from '../../../openapi';

interface IName {
    name: string;
}

interface IHoursBack {
    hoursBack: number;
}

class ClientMetricsController extends Controller {
    private logger: Logger;

    private metrics: ClientMetricsServiceV2;

    private openApiService: OpenApiService;

    private flagResolver: Pick<IFlagResolver, 'isEnabled'>;

    private static HOURS_BACK_MIN = 1;

    private static HOURS_BACK_MAX = 48;

    private static HOURS_BACK_MAX_V2 = 24 * 91; // 91 days

    constructor(
        config: IUnleashConfig,
        {
            clientMetricsServiceV2,
            openApiService,
        }: Pick<IUnleashServices, 'clientMetricsServiceV2' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/client-metrics.ts');

        this.metrics = clientMetricsServiceV2;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '/features/:name/raw',
            handler: this.getRawToggleMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getRawFeatureMetrics',
                    tags: ['Metrics'],
                    summary: 'Get feature metrics',
                    description:
                        'Get usage metrics for a specific feature for the last 48 hours, grouped by hour',
                    responses: {
                        200: createResponseSchema('featureMetricsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/features/:name',
            handler: this.getToggleMetricsSummary,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getFeatureUsageSummary',
                    tags: ['Metrics'],
                    summary: `Last hour of usage and a list of applications that have reported seeing this feature flag`,
                    description:
                        'Separate counts for yes (enabled), no (disabled), as well as how many times each variant was selected during the last hour',
                    responses: {
                        200: createResponseSchema('featureUsageSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async getRawToggleMetrics(
        req: Request<any, IName, IHoursBack, any>,
        res: Response<FeatureMetricsSchema>,
    ): Promise<void> {
        const { name } = req.params;
        const { hoursBack } = req.query;
        const data = await this.metrics.getClientMetricsForToggle(
            name,
            this.parseHoursBackQueryParam(hoursBack),
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            featureMetricsSchema.$id,
            { version: 1, maturity: 'stable', data: serializeDates(data) },
        );
    }

    async getToggleMetricsSummary(
        req: Request<IName>,
        res: Response<FeatureUsageSchema>,
    ): Promise<void> {
        const { name } = req.params;
        const data = await this.metrics.getFeatureToggleMetricsSummary(name);

        this.openApiService.respondWithValidation(
            200,
            res,
            featureUsageSchema.$id,
            { version: 1, maturity: 'stable', ...serializeDates(data) },
        );
    }

    private parseHoursBackQueryParam(param: unknown): number | undefined {
        if (typeof param !== 'string') {
            return undefined;
        }

        const parsed = Number(param);
        const max = this.flagResolver.isEnabled('extendedUsageMetrics')
            ? ClientMetricsController.HOURS_BACK_MAX_V2
            : ClientMetricsController.HOURS_BACK_MAX;

        if (parsed >= ClientMetricsController.HOURS_BACK_MIN && parsed <= max) {
            return parsed;
        }
    }
}

export default ClientMetricsController;
