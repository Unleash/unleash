import { Response } from 'express';
import Controller from '../controller';
import { IUnleashConfig, IUnleashServices } from '../../types';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';
import ClientMetricsServiceV2 from '../../services/client-metrics/metrics-service-v2';
import { User } from '../../server-impl';
import { IClientApp } from '../../types/model';
import { NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { createRequestSchema, createResponseSchema } from '../../openapi';

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
            acceptAnyContentType: true,
            handler: this.registerMetrics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['client'],
                    operationId: 'registerMetrics',
                    requestBody: createRequestSchema('clientApplicationSchema'),
                    responses: {
                        202: createResponseSchema('emptyResponse'),
                    },
                }),
            ],
        });

        this.post('/', this.registerMetrics, NONE);
    }

    private resolveEnvironment(user: User, data: IClientApp) {
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                return user.environment;
            } else if (user.environment === ALL && data.environment) {
                return data.environment;
            }
        }
        return 'default';
    }

    async registerMetrics(req: IAuthRequest, res: Response): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        data.environment = this.resolveEnvironment(user, data);
        await this.clientInstanceService.registerInstance(data, clientIp);

        await this.metricsV2.registerClientMetrics(data, clientIp);

        return res.status(202).end();
    }
}
