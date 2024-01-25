import Controller from '../../routes/controller';
import { ADMIN, IUnleashConfig, IUnleashServices } from '../../types';
import { Logger } from '../../logger';
import { InactiveUsersService } from './inactive-users-service';
import {
    createResponseSchema,
    emptyResponse,
    inactiveUsersSchema,
    InactiveUsersSchema,
} from '../../openapi';
import { IAuthRequest } from '../../routes/unleash-types';
import { Response } from 'express';
import { OpenApiService } from '../../services';
export class InactiveUsersController extends Controller {
    private readonly logger: Logger;

    private inactiveUsersService: InactiveUsersService;

    private openApiService: OpenApiService;
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

        this.route({
            method: 'get',
            path: '',
            handler: this.getInactiveUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getInactiveUsers',
                    summary: 'Gets inactive users',
                    description:
                        'Gets all inactive users. An inactive user is a user that has not logged in in the last 180 days',
                    tags: ['Users'],
                    responses: {
                        200: createResponseSchema('inactiveUsersSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '',
            handler: this.deleteInactiveUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'deleteInactiveUsers',
                    summary: 'Deletes inactive users',
                    description:
                        'Deletes all inactive users. An inactive user is a user that has not logged in in the last 180 days',
                    tags: ['Users'],
                    responses: {
                        200: emptyResponse,
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
        const inactiveUsers =
            await this.inactiveUsersService.getInactiveUsers();
        this.openApiService.respondWithValidation(
            200,
            res,
            inactiveUsersSchema.$id,
            { version: 1, inactiveUsers },
        );
    }

    async deleteInactiveUsers(
        req: IAuthRequest,
        res: Response<void>,
    ): Promise<void> {
        await this.inactiveUsersService.deleteInactiveUsers(req.user);
        res.status(200).send();
    }
}
