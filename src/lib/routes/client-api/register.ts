import { Response } from 'express';
import Controller from '../controller';
import { IUnleashServices } from '../../types';
import { IUnleashConfig } from '../../types/option';
import { Logger } from '../../logger';
import ClientInstanceService from '../../services/client-metrics/instance-service';
import { IAuthRequest, User } from '../../server-impl';
import { IClientApp } from '../../types/model';
import ApiUser from '../../types/api-user';
import { ALL } from '../../types/models/api-token';
import { NONE } from '../../types/permissions';
import { OpenApiService } from '../../services/openapi-service';
import { emptyResponse } from '../../openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { ClientApplicationSchema } from '../../openapi/spec/client-application-schema';

export default class RegisterController extends Controller {
    logger: Logger;

    clientInstanceService: ClientInstanceService;

    openApiService: OpenApiService;

    constructor(
        {
            clientInstanceService,
            openApiService,
        }: Pick<IUnleashServices, 'clientInstanceService' | 'openApiService'>,
        config: IUnleashConfig,
    ) {
        super(config);
        this.logger = config.getLogger('/api/client/register');
        this.clientInstanceService = clientInstanceService;
        this.openApiService = openApiService;

        this.route({
            method: 'post',
            path: '',
            handler: this.registerClientApplication,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Client'],
                    operationId: 'registerClientApplication',
                    requestBody: createRequestSchema('clientApplicationSchema'),
                    responses: { 202: emptyResponse },
                }),
            ],
        });
    }

    private static resolveEnvironment(user: User, data: Partial<IClientApp>) {
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                return user.environment;
            } else if (user.environment === ALL && data.environment) {
                return data.environment;
            }
        }
        return 'default';
    }

    async registerClientApplication(
        req: IAuthRequest<unknown, void, ClientApplicationSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        data.environment = RegisterController.resolveEnvironment(user, data);
        await this.clientInstanceService.registerClient(data, clientIp);
        return res.status(202).end();
    }
}
