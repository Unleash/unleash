import { Request, Response } from 'express';
import Controller from '../controller';
import { ADMIN, NONE } from '../../types/permissions';
import UserService from '../../services/user-service';
import { AccessService } from '../../services/access-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import { EmailService } from '../../services/email-service';
import ResetTokenService from '../../services/reset-token-service';
import { IUnleashServices } from '../../types/services';
import SessionService from '../../services/session-service';
import { IAuthRequest } from '../unleash-types';
import SettingService from '../../services/setting-service';
import { IUser, SimpleAuthSettings } from '../../server-impl';
import { simpleAuthKey } from '../../types/settings/simple-auth-settings';
import { anonymise } from '../../util/anonymise';
import { OpenApiService } from '../../services/openapi-service';
import { emptyResponse } from '../../openapi/spec/empty-response';
import { createRequestSchema, createResponseSchema } from '../../openapi';
import { userSchema, UserSchema } from '../../openapi/spec/user-schema';
import { serializeDates } from '../../types/serialize-dates';
import { usersSchema, UsersSchema } from '../../openapi/spec/users-schema';
import {
    usersSearchSchema,
    UsersSearchSchema,
} from '../../openapi/spec/users-search-schema';
import { CreateUserSchema } from '../../openapi/spec/create-user-schema';
import { UpdateUserSchema } from '../../openapi/spec/update-user-schema';
import { PasswordSchema } from '../../openapi/spec/password-schema';
import { IdSchema } from '../../openapi/spec/id-schema';
import {
    resetPasswordSchema,
    ResetPasswordSchema,
} from '../../openapi/spec/reset-password-schema';

export default class UserAdminController extends Controller {
    private anonymise: boolean = false;

    private userService: UserService;

    private accessService: AccessService;

    private readonly logger: Logger;

    private emailService: EmailService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    private settingService: SettingService;

    private openApiService: OpenApiService;

    readonly unleashUrl: string;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            accessService,
            emailService,
            resetTokenService,
            sessionService,
            settingService,
            openApiService,
        }: Pick<
            IUnleashServices,
            | 'userService'
            | 'accessService'
            | 'emailService'
            | 'resetTokenService'
            | 'sessionService'
            | 'settingService'
            | 'openApiService'
        >,
    ) {
        super(config);
        this.userService = userService;
        this.accessService = accessService;
        this.emailService = emailService;
        this.resetTokenService = resetTokenService;
        this.sessionService = sessionService;
        this.settingService = settingService;
        this.openApiService = openApiService;
        this.logger = config.getLogger('routes/user-controller.ts');
        this.unleashUrl = config.server.unleashUrl;
        this.anonymise = config.experimental?.anonymiseEventLog;

        this.route({
            method: 'post',
            path: '/validate-password',
            handler: this.validatePassword,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'validatePassword',
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/:id/change-password',
            handler: this.changePassword,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'changePassword',
                    requestBody: createRequestSchema('passwordSchema'),
                    responses: { 200: emptyResponse },
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/reset-password',
            handler: this.resetPassword,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'resetPassword',
                    requestBody: createRequestSchema('idSchema'),
                    responses: {
                        200: createResponseSchema('resetPasswordSchema'),
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
                    tags: ['admin'],
                    operationId: 'getUsers',
                    responses: { 200: createResponseSchema('usersSchema') },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/search',
            handler: this.searchUsers,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['admin'],
                    operationId: 'searchUsers',
                    responses: { 200: createResponseSchema('usersSchema') },
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
                    tags: ['admin'],
                    operationId: 'createUser',
                    requestBody: createRequestSchema('createUserSchema'),
                    responses: { 200: createResponseSchema('userSchema') },
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
                    tags: ['admin'],
                    operationId: 'getUser',
                    responses: { 200: createResponseSchema('userSchema') },
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
                    tags: ['admin'],
                    operationId: 'updateUser',
                    requestBody: createRequestSchema('updateUserSchema'),
                    responses: { 200: createResponseSchema('userSchema') },
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
                    tags: ['admin'],
                    operationId: 'deleteUser',
                    responses: { 200: emptyResponse },
                }),
            ],
        });
    }

    async resetPassword(
        req: IAuthRequest<unknown, ResetPasswordSchema, IdSchema>,
        res: Response<ResetPasswordSchema>,
    ): Promise<void> {
        const { user } = req;
        const receiver = req.body.id;
        const resetPasswordUrl =
            await this.userService.createResetPasswordEmail(receiver, user);

        this.openApiService.respondWithValidation(
            200,
            res,
            resetPasswordSchema.$id,
            { resetPasswordUrl: resetPasswordUrl.toString() },
        );
    }

    async getUsers(req: Request, res: Response<UsersSchema>): Promise<void> {
        const users = await this.userService.getAll();
        const rootRoles = await this.accessService.getRootRoles();
        const inviteLinks = await this.resetTokenService.getActiveInvitations();

        const usersWithInviteLinks = users.map((user) => {
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
            email: anonymise(u.email || 'random'),
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
        }));
    }

    async searchUsers(
        req: Request,
        res: Response<UsersSearchSchema>,
    ): Promise<void> {
        const { q } = req.query as any;
        let users = q && q.length > 1 ? await this.userService.search(q) : [];
        if (this.anonymise) {
            users = this.anonymiseUsers(users);
        }
        this.openApiService.respondWithValidation(
            200,
            res,
            usersSearchSchema.$id,
            serializeDates(users),
        );
    }

    async getUser(req: Request, res: Response<UserSchema>): Promise<void> {
        const { id } = req.params;
        const user = await this.userService.getUser(Number(id));

        this.openApiService.respondWithValidation(
            200,
            res,
            userSchema.$id,
            serializeDates(user),
        );
    }

    async createUser(
        req: IAuthRequest<unknown, unknown, CreateUserSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { username, email, name, rootRole, sendEmail } = req.body;
        const { user } = req;

        const createdUser = await this.userService.createUser(
            {
                username,
                email,
                name,
                rootRole,
            },
            user,
        );

        const passwordAuthSettings =
            await this.settingService.get<SimpleAuthSettings>(simpleAuthKey);

        let inviteLink: string;
        if (!passwordAuthSettings?.disabled) {
            const inviteUrl = await this.resetTokenService.createNewUserUrl(
                createdUser.id,
                user.email,
            );
            inviteLink = inviteUrl.toString();
        }

        let emailSent = false;
        const emailConfigured = this.emailService.configured();
        const reallySendEmail =
            emailConfigured && (sendEmail !== undefined ? sendEmail : true);

        if (reallySendEmail) {
            try {
                await this.emailService.sendGettingStartedMail(
                    createdUser.name,
                    createdUser.email,
                    this.unleashUrl,
                    inviteLink,
                );
                emailSent = true;
            } catch (e) {
                this.logger.warn(
                    'email was configured, but sending failed due to: ',
                    e,
                );
            }
        } else {
            this.logger.warn(
                'email was not sent to the user because email configuration is lacking',
            );
        }

        const responseData: UserSchema = {
            ...serializeDates(createdUser),
            inviteLink: inviteLink || this.unleashUrl,
            emailSent,
            rootRole,
        };

        this.openApiService.respondWithValidation(
            201,
            res,
            userSchema.$id,
            responseData,
        );
    }

    async updateUser(
        req: IAuthRequest<{ id: string }, UserSchema, UpdateUserSchema>,
        res: Response<UserSchema>,
    ): Promise<void> {
        const { user, params, body } = req;
        const { id } = params;
        const { name, email, rootRole } = body;

        const updateUser = await this.userService.updateUser(
            {
                id: Number(id),
                name,
                email,
                rootRole,
            },
            user,
        );

        this.openApiService.respondWithValidation(200, res, userSchema.$id, {
            ...serializeDates(updateUser),
            rootRole,
        });
    }

    async deleteUser(req: IAuthRequest, res: Response): Promise<void> {
        const { user, params } = req;
        const { id } = params;

        await this.userService.deleteUser(+id, user);
        res.status(200).send();
    }

    async validatePassword(
        req: IAuthRequest<unknown, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { password } = req.body;

        this.userService.validatePassword(password);
        res.status(200).send();
    }

    async changePassword(
        req: IAuthRequest<{ id: string }, unknown, PasswordSchema>,
        res: Response,
    ): Promise<void> {
        const { id } = req.params;
        const { password } = req.body;

        await this.userService.changePassword(+id, password);
        res.status(200).send();
    }
}
