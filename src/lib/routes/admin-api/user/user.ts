import type { Response } from 'express';
import type { IAuthRequest } from '../../unleash-types';
import Controller from '../../controller';
import type { AccessService } from '../../../services/access-service';
import { IAuthType, type IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types/services';
import type UserService from '../../../services/user-service';
import type UserFeedbackService from '../../../services/user-feedback-service';
import type UserSplashService from '../../../services/user-splash-service';
import { ADMIN, NONE } from '../../../types/permissions';
import type { OpenApiService } from '../../../services/openapi-service';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import { meSchema, type MeSchema } from '../../../openapi/spec/me-schema';
import { serializeDates } from '../../../types/serialize-dates';
import type {
    IRole,
    IUserPermission,
} from '../../../types/stores/access-store';
import type { PasswordSchema } from '../../../openapi/spec/password-schema';
import {
    emptyResponse,
    getStandardResponses,
} from '../../../openapi/util/standard-responses';
import {
    profileSchema,
    type ProfileSchema,
} from '../../../openapi/spec/profile-schema';
import type ProjectService from '../../../features/project/project-service';
import {
    rolesSchema,
    type RolesSchema,
} from '../../../openapi/spec/roles-schema';
import type { IFlagResolver } from '../../../types';
import type { UserSubscriptionsService } from '../../../features/user-subscriptions/user-subscriptions-service';

class UserController extends Controller {
    private accessService: AccessService;

    private userService: UserService;

    private userFeedbackService: UserFeedbackService;

    private userSplashService: UserSplashService;

    private openApiService: OpenApiService;

    private projectService: ProjectService;

    private flagResolver: IFlagResolver;

    private userSubscriptionsService: UserSubscriptionsService;

    constructor(
        config: IUnleashConfig,
        {
            accessService,
            userService,
            userFeedbackService,
            userSplashService,
            openApiService,
            projectService,
            transactionalUserSubscriptionsService,
        }: Pick<
            IUnleashServices,
            | 'accessService'
            | 'userService'
            | 'userFeedbackService'
            | 'userSplashService'
            | 'openApiService'
            | 'projectService'
            | 'transactionalUserSubscriptionsService'
        >,
    ) {
        super(config);
        this.accessService = accessService;
        this.userService = userService;
        this.userFeedbackService = userFeedbackService;
        this.userSplashService = userSplashService;
        this.openApiService = openApiService;
        this.projectService = projectService;
        this.userSubscriptionsService = transactionalUserSubscriptionsService;
        this.flagResolver = config.flagResolver;

        this.route({
            method: 'get',
            path: '',
            handler: this.getMe,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getMe',
                    summary: 'Get your own user details',
                    description:
                        'Detailed information about the current user, user permissions and user feedback',
                    responses: {
                        200: createResponseSchema('meSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/profile',
            handler: this.getProfile,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getProfile',
                    summary: 'Get your own user profile',
                    description:
                        'Detailed information about the current user root role and project membership',
                    responses: {
                        200: createResponseSchema('profileSchema'),
                        ...getStandardResponses(401),
                    },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/change-password',
            handler: this.changeMyPassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'changeMyPassword',
                    summary: 'Change your own password',
                    description:
                        'Requires specifying old password and confirming new password',
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: {
                        200: emptyResponse,
                        400: {
                            description: 'Old and new password do not match',
                        },
                        401: {
                            description:
                                'Old password is incorrect or user is not authenticated',
                        },
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/roles',
            handler: this.getRoles,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Users'],
                    operationId: 'getUserRoles',
                    summary: 'Get roles for currently logged in user',
                    parameters: [
                        {
                            name: 'projectId',
                            description:
                                'The id of the project you want to check permissions for',
                            schema: {
                                type: 'string',
                            },
                            in: 'query',
                        },
                    ],
                    description:
                        'Gets roles assigned to currently logged in user. Both explicitly and transitively through group memberships',
                    responses: {
                        200: createResponseSchema('rolesSchema'),
                        ...getStandardResponses(401, 403),
                    },
                }),
            ],
        });
    }

    async getRoles(
        req: IAuthRequest,
        res: Response<RolesSchema>,
    ): Promise<void> {
        const { projectId } = req.query;
        if (projectId) {
            let roles: IRole[];
            if (this.flagResolver.isEnabled('projectRoleAssignment')) {
                roles = await this.accessService.getProjectRoles();
            } else {
                roles = await this.accessService.getAllProjectRolesForUser(
                    req.user.id,
                    projectId,
                );
            }
            this.openApiService.respondWithValidation(
                200,
                res,
                rolesSchema.$id,
                {
                    version: 1,
                    roles,
                },
            );
        } else {
            res.status(400).end();
        }
    }
    async getMe(req: IAuthRequest, res: Response<MeSchema>): Promise<void> {
        res.setHeader('cache-control', 'no-store');
        const { user } = req;
        let permissions: IUserPermission[];
        if (this.config.authentication.type === IAuthType.NONE) {
            permissions = [{ permission: ADMIN }];
        } else {
            permissions = await this.accessService.getPermissionsForUser(user);
        }
        const feedback =
            await this.userFeedbackService.getAllUserFeedback(user);
        const splash = await this.userSplashService.getAllUserSplashes(user);

        const responseData: MeSchema = {
            user: serializeDates(user),
            permissions,
            feedback: serializeDates(feedback),
            splash,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            meSchema.$id,
            responseData,
        );
    }

    async getProfile(
        req: IAuthRequest,
        res: Response<ProfileSchema>,
    ): Promise<void> {
        const { user } = req;

        const [projects, rootRole, subscriptions] = await Promise.all([
            this.projectService.getProjectsByUser(user.id),
            this.accessService.getRootRoleForUser(user.id),
            this.userSubscriptionsService.getUserSubscriptions(user.id),
        ]);

        const responseData: ProfileSchema = {
            projects,
            rootRole,
            subscriptions,
            features: [],
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            profileSchema.$id,
            responseData,
        );
    }

    async changeMyPassword(
        req: IAuthRequest<unknown, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { user } = req;
        const { password, confirmPassword, oldPassword } = req.body;
        if (password === confirmPassword && oldPassword != null) {
            this.userService.validatePassword(password);
            await this.userService.changePasswordWithVerification(
                user.id,
                password,
                oldPassword,
            );
            res.status(200).end();
        } else {
            res.status(400).end();
        }
    }
}

module.exports = UserController;
export default UserController;
