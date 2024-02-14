import { Response } from 'express';
import Controller from '../../../routes/controller';
import { IUnleashServices } from '../../../types';
import { IUnleashConfig } from '../../../types/option';
import { Logger } from '../../../logger';
import ClientInstanceService from './instance-service';
import { IAuthRequest, IUser } from '../../../server-impl';
import { IClientApp } from '../../../types/model';
import ApiUser, { IApiUser } from '../../../types/api-user';
import { ALL } from '../../../types/models/api-token';
import { NONE } from '../../../types/permissions';
import { OpenApiService } from '../../../services/openapi-service';
import { emptyResponse } from '../../../openapi/util/standard-responses';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { ClientApplicationSchema } from '../../../openapi/spec/client-application-schema';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import version from '../../../util/version';

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
                    summary: 'Register a client SDK',
                    description:
                        'Register a client SDK with Unleash. SDKs call this endpoint on startup to tell Unleash about their existence. Used to track custom strategies in use as well as SDK versions.',
                    operationId: 'registerClientApplication',
                    requestBody: createRequestSchema('clientApplicationSchema'),
                    responses: { 202: emptyResponse },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.metricsRateLimiting.clientRegisterMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });
    }

    private static resolveEnvironment(
        user: IUser | IApiUser,
        data: Partial<IClientApp>,
    ) {
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                return user.environment;
            } else if (user.environment === ALL && data.environment) {
                return data.environment;
            }
        }
        return 'default';
    }

    private static extractProjectFromRequest(
        req: IAuthRequest<unknown, void, ClientApplicationSchema>,
    ) {
        const token = req.get('Authorisation');
        if (token) {
            return token.split(':')[0];
        }
        return 'default';
    }

    async registerClientApplication(
        req: IAuthRequest<unknown, void, ClientApplicationSchema>,
        res: Response<void>,
    ): Promise<void> {
        const { body: data, ip: clientIp, user } = req;
        data.environment = RegisterController.resolveEnvironment(user, data);
        data.project = RegisterController.extractProjectFromRequest(req);
        await this.clientInstanceService.registerClient(data, clientIp);
        res.header('X-Unleash-Version', version).status(202).end();
    }
}
