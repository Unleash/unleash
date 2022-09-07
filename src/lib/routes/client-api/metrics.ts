import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';
import { NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses';

export default class ClientMetricsController extends Controller {
    logger: Logger;

    clientInstanceService: ClientInstanceService;

    openApiService: OpenApiService;

    metricsV2: ClientMetricsServiceV2;

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

        this.route({
            method: 'post',
            path: '',
            handler: this.registerMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Client'],
                    operationId: 'registerClientMetrics',
                    requestBody: createRequestSchema('clientMetricsSchema'),
                    responses: {
                        ...getStandardResponses(400),
                        202: emptyResponse,
                    },
                }),
            ],
        });
    }

    async registerMetrics(req: IAuthRequest, res: Response): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        data.environment = this.metricsV2.resolveMetricsEnvironment(user, data);
        await this.clientInstanceService.registerInstance(data, clientIp);

        try {
            await this.metricsV2.registerClientMetrics(data, clientIp);
            return res.status(202).end();
        } catch (e) {
            return res.status(400).end();
        }
    }
}
