import Controller from '../../routes/controller.js';
import {
    ADMIN,
    type IFlagResolver,
    type IUnleashConfig,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import type { InactiveUsersService } from './inactive-users-service.js';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    type IdsSchema,
    type InactiveUserSchema,
    inactiveUsersSchema,
    type InactiveUsersSchema,
} from '../../openapi/index.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';
import type { Response } from 'express';
import type { IUnleashServices, OpenApiService } from '../../services/index.js';
import { anonymise } from '../../util/index.js';
export class InactiveUsersController extends Controller {
    private readonly logger: Logger;

    private inactiveUsersService: InactiveUsersService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;

    private readonly userInactivityThresholdInDays: number;
    constructor(
        config: IUnleashConfig,
        {
            inactiveUsersService,
            openApiService,
        }: Pick<IUnleashServices, 'inactiveUsersService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger(
            'user/inactive/inactive-users-controller.ts',
        );
        this.inactiveUsersService = inactiveUsersService;
        this.openApiService = openApiService;
        this.flagResolver = config.flagResolver;
        this.userInactivityThresholdInDays =
            config.userInactivityThresholdInDays;

        this.route({
            method: 'get',
            path: '',
            handler: this.getInactiveUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getInactiveUsers',
                    summary: 'Gets inactive users',
                    description: `Gets all inactive users. An inactive user is a user that has not logged in in the last ${this.userInactivityThresholdInDays} days`,
                    tags: ['Users'],
                    responses: {
                        200: createResponseSchema('inactiveUsersSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/delete',
            handler: this.deleteInactiveUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'deleteInactiveUsers',
                    summary: 'Deletes inactive users',
                    description: `Deletes all inactive users. An inactive user is a user that has not logged in in the last ${this.userInactivityThresholdInDays} days`,
                    tags: ['Users'],
                    requestBody: createRequestSchema('idsSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });
    }

    async getInactiveUsers(
        _req: IAuthRequest,
        res: Response<InactiveUsersSchema>,
    ): Promise<void> {
        this.logger.info('Hitting inactive users');
        let inactiveUsers = await this.inactiveUsersService.getInactiveUsers();
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            inactiveUsers = this.anonymiseUsers(inactiveUsers);
        }
        this.openApiService.respondWithValidation(
            200,
            res,
            inactiveUsersSchema.$id,
            { version: 1, inactiveUsers },
        );
    }
    anonymiseUsers(users: InactiveUserSchema[]): InactiveUserSchema[] {
        return users.map((u) => ({
            ...u,
            name: anonymise(u.name || ''),
            username: anonymise(u.username || ''),
            email: anonymise(u.email || 'random'),
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }
    async deleteInactiveUsers(
        req: IAuthRequest<{}, undefined, IdsSchema>,
        res: Response<void>,
    ): Promise<void> {
        await this.inactiveUsersService.deleteInactiveUsers(
            req.audit,
            req.body.ids.filter((inactiveUser) => inactiveUser !== req.user.id),
        );
        res.status(200).send();
    }
}
