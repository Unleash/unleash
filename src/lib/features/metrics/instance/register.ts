import type { Response } from 'express';
import Controller from '../../../routes/controller';
import type { IFlagResolver, IUnleashServices } from '../../../types';
import type { IUnleashConfig } from '../../../types/option';
import type { Logger } from '../../../logger';
import type ClientInstanceService from './instance-service';
import type { IAuthRequest, IUser } from '../../../server-impl';
import type { IClientApp } from '../../../types/model';
import ApiUser, { type IApiUser } from '../../../types/api-user';
import { ALL } from '../../../types/models/api-token';
import { NONE } from '../../../types/permissions';
import type { OpenApiService } from '../../../services/openapi-service';
import { emptyResponse } from '../../../openapi/util/standard-responses';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import type { ClientApplicationSchema } from '../../../openapi/spec/client-application-schema';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import version from '../../../util/version';

export default class RegisterController extends Controller {
    logger: Logger;

    clientInstanceService: ClientInstanceService;

    openApiService: OpenApiService;

    flagResolver: IFlagResolver;

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
        this.flagResolver = config.flagResolver;

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

    private resolveEnvironment(
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

    private resolveProject(user: IUser | IApiUser) {
        if (user instanceof ApiUser) {
            return user.projects;
        }
        return ['default'];
    }

    private extractProjectFromRequest(
        req: IAuthRequest<unknown, void, ClientApplicationSchema>,
    ) {
        const token = req.get('Authorisation') || req.headers.authorization;
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
        data.environment = this.resolveEnvironment(user, data);
        if (this.flagResolver.isEnabled('parseProjectFromSession')) {
            data.projects = this.resolveProject(user);
        } else {
            data.project = this.extractProjectFromRequest(req);
        }

        await this.clientInstanceService.registerClient(data, clientIp);
        res.header('X-Unleash-Version', version).status(202).end();
    }
}
