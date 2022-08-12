import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { OpenApiService } from '../../services/openapi-service';
import { serializeDates } from '../../types/serialize-dates';
import {
    FeatureUsageSchema,
    featureUsageSchema,
} from '../../openapi/spec/feature-usage-schema';
import {
    featureMetricsSchema,
    FeatureMetricsSchema,
} from '../../openapi/spec/feature-metrics-schema';

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

    private static HOURS_BACK_MIN = 1;

    private static HOURS_BACK_MAX = 48;

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

        this.route({
            method: 'get',
            path: '/features/:name/raw',
            handler: this.getRawToggleMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getRawFeatureMetrics',
                    tags: ['Metrics'],
                    responses: {
                        200: createResponseSchema('featureMetricsSchema'),
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
                    responses: {
                        200: createResponseSchema('featureUsageSchema'),
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

        if (
            parsed >= ClientMetricsController.HOURS_BACK_MIN &&
            parsed <= ClientMetricsController.HOURS_BACK_MAX
        ) {
            return parsed;
        }
    }
}

export default ClientMetricsController;
