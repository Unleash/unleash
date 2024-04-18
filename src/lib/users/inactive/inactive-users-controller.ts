import Controller from '../../routes/controller';
import {
    ADMIN,
    type IFlagResolver,
    type IUnleashConfig,
    type IUnleashServices,
} from '../../types';
import type { Logger } from '../../logger';
import type { InactiveUsersService } from './inactive-users-service';
import {
    createRequestSchema,
    createResponseSchema,
    emptyResponse,
    getStandardResponses,
    type IdsSchema,
    type InactiveUserSchema,
    inactiveUsersSchema,
    type InactiveUsersSchema,
} from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { Response } from 'express';
import type { OpenApiService } from '../../services';
import { DAYS_TO_BE_COUNTED_AS_INACTIVE } from './createInactiveUsersService';
import { anonymise } from '../../util';
export class InactiveUsersController extends Controller {
    private readonly logger: Logger;

    private inactiveUsersService: InactiveUsersService;

    private openApiService: OpenApiService;

    private flagResolver: IFlagResolver;
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

        this.route({
            method: 'get',
            path: '',
            handler: this.getInactiveUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getInactiveUsers',
                    summary: 'Gets inactive users',
                    description: `Gets all inactive users. An inactive user is a user that has not logged in in the last ${DAYS_TO_BE_COUNTED_AS_INACTIVE} days`,
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
                    description: `Deletes all inactive users. An inactive user is a user that has not logged in in the last ${DAYS_TO_BE_COUNTED_AS_INACTIVE} days`,
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
        req: IAuthRequest<undefined, undefined, IdsSchema>,
        res: Response<void>,
    ): Promise<void> {
        await this.inactiveUsersService.deleteInactiveUsers(
            req.audit,
            req.body.ids.filter((inactiveUser) => inactiveUser !== req.user.id),
        );
        res.status(200).send();
    }
}
