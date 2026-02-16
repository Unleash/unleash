import type { Request, Response } from 'express';
import Controller from '../controller.js';
import { ADMIN, NONE } from '../../types/permissions.js';
import type UserService from '../../services/user-service.js';
import type { AccountService } from '../../services/account-service.js';
import type { AccessService } from '../../services/access-service.js';
import type { Logger } from '../../logger.js';
import type { IUnleashConfig, RoleName } from '../../types/index.js';
import type { IUnleashServices } from '../../services/index.js';
import type ResetTokenService from '../../services/reset-token-service.js';
import type { IAuthRequest } from '../unleash-types.js';
import type SettingService from '../../services/setting-service.js';
import type { IUser } from '../../types/index.js';
import { anonymise } from '../../util/anonymise.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createRequestSchema } from '../../openapi/util/create-request-schema.js';
import {
    createResponseSchema,
    resourceCreatedResponseSchema,
} from '../../openapi/util/create-response-schema.js';
import { userSchema, type UserSchema } from '../../openapi/spec/user-schema.js';
import { serializeDates } from '../../types/serialize-dates.js';
import {
    usersSchema,
    type UsersSchema,
} from '../../openapi/spec/users-schema.js';
import {
    usersSearchSchema,
    type UsersSearchSchema,
} from '../../openapi/spec/users-search-schema.js';
import type { CreateUserSchema } from '../../openapi/spec/create-user-schema.js';
import type { UpdateUserSchema } from '../../openapi/spec/update-user-schema.js';
import type { PasswordSchema } from '../../openapi/spec/password-schema.js';
import type { IdSchema } from '../../openapi/spec/id-schema.js';
import {
    resetPasswordSchema,
    type ResetPasswordSchema,
} from '../../openapi/spec/reset-password-schema.js';
import {
    emptyResponse,
    getStandardResponses,
} from '../../openapi/util/standard-responses.js';
import type { GroupService } from '../../services/group-service.js';
import {
    type UsersGroupsBaseSchema,
    usersGroupsBaseSchema,
} from '../../openapi/spec/users-groups-base-schema.js';
import type { IGroup } from '../../types/group.js';
import type { IFlagResolver } from '../../types/experimental.js';
import rateLimit from 'express-rate-limit';
import { minutesToMilliseconds } from 'date-fns';
import {
    type AdminCountSchema,
    adminCountSchema,
} from '../../openapi/spec/admin-count-schema.js';
import { ForbiddenError } from '../../error/index.js';
import {
    createUserResponseSchema,
    type CreateUserResponseSchema,
} from '../../openapi/spec/create-user-response-schema.js';
import type { IRoleWithPermissions } from '../../types/stores/access-store.js';
import {
    type UserAccessOverviewSchema,
    userAccessOverviewSchema,
} from '../../openapi/index.js';
import type { WithTransactional } from '../../server-impl.js';

export default class UserAdminController extends Controller {
    private flagResolver: IFlagResolver;

    private userService: WithTransactional<UserService>;

    private accountService: AccountService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private resetTokenService: ResetTokenService;

    private settingService: SettingService;

    private openApiService: OpenApiService;

    private groupService: GroupService;

    readonly isEnterprise: boolean;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            accountService,
            accessService,
            resetTokenService,
            settingService,
            openApiService,
            groupService,
        }: Pick<
            IUnleashServices,
            | 'userService'
            | 'accountService'
            | 'accessService'
            | 'emailService'
            | 'resetTokenService'
            | 'settingService'
            | 'openApiService'
            | 'groupService'
        >,
    ) {
        super(config);
        this.userService = userService;
        this.accountService = accountService;
        this.accessService = accessService;
        this.resetTokenService = resetTokenService;
        this.settingService = settingService;
        this.openApiService = openApiService;
        this.groupService = groupService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.flagResolver = config.flagResolver;
        this.isEnterprise = config.isEnterprise;

        this.route({
            method: 'post',
            path: '/validate-password',
            handler: this.validateUserPassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'validateUserPassword',
                    summary: 'Validate password for a user',
                    description:
                        'Validate the password strength. Minimum 10 characters, uppercase letter, number, special character.',
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:id/change-password',
            handler: this.changeUserPassword,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'changeUserPassword',
                    summary: 'Change password for a user',
                    description: 'Change password for a user as an admin',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/reset-password',
            handler: this.resetUserPassword,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'resetUserPassword',
                    summary: 'Reset user password',
                    description: 'Reset user password as an admin',
                    requestBody: createRequestSchema('idSchema'),
                    responses: {
                        200: createResponseSchema('resetPasswordSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '',
            handler: this.getUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getUsers',
                    summary:
                        'Get all users and [root roles](https://docs.getunleash.io/concepts/rbac#predefined-roles)',
                    description:
                        'Will return all users and all available root roles for the Unleash instance.',
                    responses: {
                        200: createResponseSchema('usersSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/search',
            handler: this.searchUsers,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'searchUsers',
                    summary: 'Search users',
                    description:
                        ' It will preform a simple search based on name and email matching the given query. Requires minimum 2 characters',
                    parameters: [
                        {
                            name: 'q',
                            description:
                                'The pattern to search in the username or email',
                            schema: { type: 'string' },
                            in: 'query',
                        },
                    ],
                    responses: {
                        200: createResponseSchema('usersSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/access',
            handler: this.getBaseUsersAndGroups,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getBaseUsersAndGroups',
                    summary: 'Get basic user and group information',
                    description:
                        'Get a subset of user and group information eligible even for non-admin users',
                    responses: {
                        200: createResponseSchema('usersGroupsBaseSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:id/permissions',
            permission: ADMIN,
            handler: this.getPermissions,
            middleware: [
                openApiService.validPath({
                    tags: ['Instance Admin'],
                    release: { alpha: true },
                    operationId: 'getUserPermissions',
                    summary: 'Returns the list of permissions for the user',
                    description:
                        'Gets a list of permissions for a user, additional project and environment can be specified.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                        {
                            name: 'project',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'environment',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                            },
                        },
                    ],
                    responses: {
                        200: createResponseSchema(userAccessOverviewSchema.$id),
                        ...getStandardResponses(401, 403, 415),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/admin-count',
            handler: this.getAdminCount,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getAdminCount',
                    summary: 'Get total count of admin accounts',
                    description:
                        'Get a total count of admins with password, without password and admin service accounts',
                    responses: {
                        200: createResponseSchema('adminCountSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '',
            handler: this.createUser,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'createUser',
                    summary: 'Create a new user',
                    description: 'Creates a new user with the given root role.',
                    requestBody: createRequestSchema('createUserSchema'),
                    responses: {
                        201: resourceCreatedResponseSchema(
                            'createUserResponseSchema',
                        ),
                        ...getStandardResponses(400, 401, 403),
                    },
                }),
                rateLimit({
                    windowMs: minutesToMilliseconds(1),
                    max: config.rateLimiting.createUserMaxPerMinute,
                    validate: false,
                    standardHeaders: true,
                    legacyHeaders: false,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:id',
            handler: this.getUser,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getUser',
                    summary: 'Get user',
                    description: 'Will return a single user by id',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: createResponseSchema('userSchema'),
                        ...getStandardResponses(400, 401, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'put',
            path: '/:id',
            handler: this.updateUser,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'updateUser',
                    summary: 'Update a user',
                    description:
                        'Only the explicitly specified fields get updated.',
                    requestBody: createRequestSchema('updateUserSchema'),
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: createResponseSchema('createUserResponseSchema'),
                        ...getStandardResponses(400, 401, 403, 404),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/scim-users',
            acceptAnyContentType: true,
            handler: this.deleteScimUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteScimUsers',
                    summary: 'Delete all SCIM users',
                    description: 'Deletes all users managed by SCIM',
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });

        this.route({
            method: 'delete',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.deleteUser,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'deleteUser',
                    summary: 'Delete a user',
                    description: 'Deletes the user with the given userId',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a user id',
                        },
                    ],
                    responses: {
                        200: emptyResponse,
                        ...getStandardResponses(401, 403, 404),
                    },
                }),
            ],
        });
    }

    async resetUserPassword(
        req: IAuthRequest<unknown, ResetPasswordSchema, IdSchema>,
        res: Response<ResetPasswordSchema>,
    ): Promise<void> {
        const { user } = req;
        const receiver = req.body.id;
        const receiverUser = await this.userService.getByEmail(receiver);
        await this.throwIfScimUser(receiverUser);
        const resetPasswordUrl =
            await this.userService.createResetPasswordEmail(receiver, user);

        this.openApiService.respondWithValidation(
            200,
            res,
            resetPasswordSchema.$id,
            { resetPasswordUrl: resetPasswordUrl.toString() },
        );
    }

    async getUsers(_req: Request, res: Response<UsersSchema>): Promise<void> {
        const users = await this.userService.getAll();
        const rootRoles = await this.accessService.getRootRoles();
        const inviteLinks = await this.resetTokenService.getActiveInvitations();

        const usersWithInviteLinks = users.map(({ isAPI, ...user }) => {
            const inviteLink = inviteLinks[user.id] || '';
            return { ...user, inviteLink };
        });

        this.openApiService.respondWithValidation(200, res, usersSchema.$id, {
            users: serializeDates(usersWithInviteLinks),
            rootRoles,
        });
    }

    anonymiseUsers(users: IUser[]): IUser[] {
        return users.map((u) => ({
            ...u,
            name: anonymise(u.name),
            username: anonymise(u.username),
            email: anonymise(u.email || 'random'),
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }

    async searchUsers(
        req: Request,
        res: Response<UsersSearchSchema>,
    ): Promise<void> {
        const { q } = req.query;
        let users =
            typeof q === 'string' && q.length > 1
                ? await this.userService.search(q)
                : [];
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            users = this.anonymiseUsers(users);
        }
        this.openApiService.respondWithValidation(
            200,
            res,
            usersSearchSchema.$id,
            serializeDates(users.map(({ isAPI, ...u }) => u)),
        );
    }

    async getBaseUsersAndGroups(
        _req: Request,
        res: Response<UsersGroupsBaseSchema>,
    ): Promise<void> {
        const allUsers = await this.accountService.getAll();
        let users = allUsers.map((u) => {
            return {
                id: u.id,
                name: u.name,
                username: u.username,
                email: u.email,
                accountType: u.accountType,
            } as IUser;
        });
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            users = this.anonymiseUsers(users);
        }

        const allGroups = await this.groupService.getAll();
        const groups = allGroups.map((g) => {
            return {
                id: g.id,
                name: g.name,
                userCount: g.users.length,
                rootRole: g.rootRole,
            } as IGroup;
        });
        this.openApiService.respondWithValidation(
            200,
            res,
            usersGroupsBaseSchema.$id,
            {
                users: serializeDates(users),
                groups: serializeDates(groups),
            },
        );
    }

    async getUser(
        req: Request<{ id: number }>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { id } = req.params;
        const { isAPI, ...user } = await this.userService.getUser(id);

        this.openApiService.respondWithValidation(
            200,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }

    async createUser(
        req: IAuthRequest<unknown, unknown, CreateUserSchema>,
        res: Response<CreateUserResponseSchema>,
    ): Promise<void> {
        const { username, email, name, rootRole, sendEmail, password } =
            req.body;
        const normalizedRootRole = Number.isInteger(Number(rootRole))
            ? Number(rootRole)
            : (rootRole as RoleName);

        const responseData = await this.userService.transactional(
            async (txUserService) => {
                const createdUser = await txUserService.createUser(
                    {
                        username,
                        email,
                        name,
                        password,
                        rootRole: normalizedRootRole,
                    },
                    req.audit,
                );

                const inviteLink = await txUserService.newUserInviteLink(
                    createdUser,
                    req.audit,
                );

                // send email defaults to true
                const emailSent = (sendEmail !== undefined ? sendEmail : true)
                    ? await txUserService.sendWelcomeEmail(
                          createdUser,
                          inviteLink,
                      )
                    : false;

                const { isAPI, ...user } = createdUser;
                const responseData: CreateUserResponseSchema = {
                    ...serializeDates(user),
                    inviteLink,
                    emailSent,
                    rootRole: normalizedRootRole,
                };
                return responseData;
            },
        );

        this.openApiService.respondWithValidation(
            201,
            res,
            createUserResponseSchema.$id,
            responseData,
            { location: `${responseData.id}` },
        );
    }

    async updateUser(
        req: IAuthRequest<
            { id: number },
            CreateUserResponseSchema,
            UpdateUserSchema
        >,
        res: Response<CreateUserResponseSchema>,
    ): Promise<void> {
        const { params, body } = req;
        const { id } = params;
        const { name, email, rootRole } = body;

        await this.throwIfScimUser({ id });
        const normalizedRootRole = Number.isInteger(Number(rootRole))
            ? Number(rootRole)
            : (rootRole as RoleName);

        const { isAPI, ...updateUser } = await this.userService.updateUser(
            {
                id,
                name,
                email,
                rootRole: normalizedRootRole,
            },
            req.audit,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            createUserResponseSchema.$id,
            {
                ...serializeDates(updateUser),
                rootRole: normalizedRootRole,
            },
        );
    }

    async deleteUser(
        req: IAuthRequest<{ id: number }>,
        res: Response,
    ): Promise<void> {
        const { id } = req.params;

        await this.userService.deleteUser(+id, req.audit);
        res.status(200).send();
    }

    async validateUserPassword(
        req: IAuthRequest<unknown, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { password } = req.body;

        this.userService.validatePassword(password);
        res.status(200).send();
    }

    async changeUserPassword(
        req: IAuthRequest<{ id: number }, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { id } = req.params;
        const { password } = req.body;

        await this.throwIfScimUser({ id });

        await this.userService.changePassword(+id, password);
        res.status(200).send();
    }

    async getAdminCount(
        _req: Request,
        res: Response<AdminCountSchema>,
    ): Promise<void> {
        const adminCount = await this.accountService.getAdminCount();

        this.openApiService.respondWithValidation(
            200,
            res,
            adminCountSchema.$id,
            adminCount,
        );
    }

    async getPermissions(
        req: IAuthRequest<
            { id: number },
            unknown,
            unknown,
            { project?: string; environment?: string }
        >,
        res: Response<UserAccessOverviewSchema>,
    ): Promise<void> {
        const { project, environment } = req.query;
        const { isAPI, ...user } = await this.userService.getUser(
            req.params.id,
        );
        const rootRole = await this.accessService.getRootRoleForUser(user.id);
        let projectRoles: IRoleWithPermissions[] = [];
        if (project) {
            const projectRoleIds =
                await this.accessService.getProjectRolesForUser(
                    project,
                    user.id,
                );

            projectRoles = await Promise.all(
                projectRoleIds.map((roleId) =>
                    this.accessService.getRole(roleId),
                ),
            );
        }
        const overview = await this.accessService.getAccessOverviewForUser(
            user,
            project,
            environment,
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            userAccessOverviewSchema.$id,
            {
                overview,
                user: serializeDates(user),
                rootRole,
                projectRoles,
            },
        );
    }

    async throwIfScimUser({
        id,
        scimId,
    }: Pick<IUser, 'id' | 'scimId'>): Promise<void> {
        if (!this.isEnterprise) return;

        const isScimUser = await this.isScimUser({ id, scimId });
        if (!isScimUser) return;

        const { enabled } = await this.settingService.getWithDefault('scim', {
            enabled: false,
        });
        if (!enabled) return;

        throw new ForbiddenError(
            'This user is managed by your SCIM provider and cannot be changed manually',
        );
    }

    async isScimUser({
        id,
        scimId,
    }: Pick<IUser, 'id' | 'scimId'>): Promise<boolean> {
        return (
            Boolean(scimId) ||
            Boolean((await this.userService.getUser(id)).scimId)
        );
    }

    async deleteScimUsers(req: IAuthRequest, res: Response): Promise<void> {
        const { audit } = req;
        await this.userService.deleteScimUsers(audit);
        res.status(200).send();
    }
}
