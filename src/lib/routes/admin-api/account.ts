import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN, NONE } from '../../types/permissions';
import { AccessService } from '../../services/access-service';
import { Logger } from '../../logger';
import {
    IAccount,
    IGroup,
    IUnleashConfig,
    IUnleashServices,
} from '../../types';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../types/serialize-dates';
import { GroupService } from '../../services/group-service';
import { AccountService } from '../../services/account-service';
import {
    accessSchema,
    AccessSchema,
    accountsSchema,
    AccountsSchema,
} from '../../openapi';

export default class AccountController extends Controller {
    private accountService: AccountService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private openApiService: OpenApiService;

    private groupService: GroupService;

    readonly unleashUrl: string;

    constructor(
        config: IUnleashConfig,
        {
            accountService,
            accessService,
            openApiService,
            groupService,
        }: Pick<
            IUnleashServices,
            | 'accountService'
            | 'accessService'
            | 'openApiService'
            | 'groupService'
        >,
    ) {
        super(config);
        this.accountService = accountService;
        this.accessService = accessService;
        this.openApiService = openApiService;
        this.groupService = groupService;
        this.logger = config.getLogger('routes/admin-api/account.ts');
        this.unleashUrl = config.server.unleashUrl;

        this.route({
            method: 'get',
            path: '',
            handler: this.getAccounts,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getAccounts',
                    responses: { 200: createResponseSchema('accountsSchema') },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/access',
            handler: this.getAccess,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Unstable'],
                    operationId: 'getAccess',
                    responses: {
                        200: createResponseSchema('accessSchema'),
                    },
                }),
            ],
        });
    }

    async getAccounts(
        req: Request,
        res: Response<AccountsSchema>,
    ): Promise<void> {
        const accounts = await this.accountService.getAll();
        const rootRoles = await this.accessService.getRootRoles();

        this.openApiService.respondWithValidation(
            200,
            res,
            accountsSchema.$id,
            {
                accounts: serializeDates(accounts),
                rootRoles,
            },
        );
    }

    async getAccess(req: Request, res: Response<AccessSchema>): Promise<void> {
        const allAccounts = await this.accountService.getAll();
        const accounts = allAccounts.map((u) => {
            return {
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
            } as IAccount;
        });

        const allGroups = await this.groupService.getAll();
        const groups = allGroups.map((g) => {
            return {
                id: g.id,
                name: g.name,
                userCount: g.users.length,
            } as IGroup;
        });
        this.openApiService.respondWithValidation(200, res, accessSchema.$id, {
            accounts: serializeDates(accounts),
            groups: serializeDates(groups),
        });
    }
}
