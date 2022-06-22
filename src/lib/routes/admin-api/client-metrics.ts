import { Request, Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';
import { NONE } from '../../types/permissions';
import { createResponseSchema } from '../../openapi';
import { OpenApiService } from '../../services/openapi-service';
import { clientMetricsEnvSchema } from '../../openapi/spec/client-metrics-env-schema';
import { ToggleMetricsSummarySchema } from '../../../../dist/lib/openapi/spec/toggle-metrics-summary-schema';
import { serializeDates } from '../../types/serialize-dates';
import { toggleMetricsSummarySchema } from '../../openapi/spec/toggle-metrics-summary-schema';
import { ClientMetricsResponseSchema } from '../../openapi/spec/client-metrics-response-schema';

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

        this.route({
            method: 'get',
            path: '/features/:name',
            handler: this.getToggleMetricsSummary,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getToggleMetricsSummary',
                    tags: ['admin'],
                    responses: {
                        200: createResponseSchema('toggleMetricsSummarySchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/features/:name/raw',
            handler: this.getRawToggleMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getRawToggleMetrics',
                    tags: ['admin'],
                    responses: {
                        200: createResponseSchema(
                            'clientMetricsResponseSchema',
                        ),
                    },
                }),
            ],
        });
    }

    async getRawToggleMetrics(
        req: Request<any, { name: string }, { hoursBack: number }, any>,
        res: Response<ClientMetricsResponseSchema>,
    ): Promise<void> {
        const { name } = req.params;
        const { hoursBack } = req.query;
        const data = await this.metrics.getClientMetricsForToggle(
            name,
            this.parseHoursBackQueryParam(hoursBack),
        );
        this.openApiService.respondWithValidation(
            200,
            res.header('Content-Type', 'json'),
            clientMetricsEnvSchema.$id,
            { version: 1, maturity: 'stable', data: serializeDates(data) },
        );
    }

    async getToggleMetricsSummary(
        req: Request<any, { name: string }>,
        res: Response<ToggleMetricsSummarySchema>,
    ): Promise<void> {
        const { name } = req.params;
        const data = await this.metrics.getFeatureToggleMetricsSummary(name);

        this.openApiService.respondWithValidation(
            200,
            res.header('Content-Type', 'json'),
            toggleMetricsSummarySchema.$id,
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
