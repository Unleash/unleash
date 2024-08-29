import bcrypt from 'bcryptjs';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import type { URL } from 'url';
import type { Logger } from '../logger';
import User, {
    type IAuditUser,
    type IUser,
    type IUserWithRootRole,
} from '../types/user';
import isEmail from '../util/is-email';
import type { AccessService } from './access-service';
import type ResetTokenService from './reset-token-service';
import NotFoundError from '../error/notfound-error';
import OwaspValidationError from '../error/owasp-validation-error';
import type { EmailService } from './email-service';
import type {
    IAuthOption,
    IUnleashConfig,
    UsernameAdminUser,
} from '../types/option';
import type SessionService from './session-service';
import type { IUnleashStores } from '../types/stores';
import PasswordUndefinedError from '../error/password-undefined';
import {
    UserCreatedEvent,
    UserDeletedEvent,
    UserUpdatedEvent,
} from '../types/events';
import type { IUserStore } from '../types/stores/user-store';
import { RoleName } from '../types/model';
import type SettingService from './setting-service';
import type { SimpleAuthSettings } from '../server-impl';
import { simpleAuthSettingsKey } from '../types/settings/simple-auth-settings';
import DisabledError from '../error/disabled-error';
import BadDataError from '../error/bad-data-error';
import { isDefined } from '../util/isDefined';
import type { TokenUserSchema } from '../openapi/spec/token-user-schema';
import PasswordMismatch from '../error/password-mismatch';
import type EventService from '../features/events/event-service';

import { SYSTEM_USER, SYSTEM_USER_AUDIT } from '../types';
import { PasswordPreviouslyUsedError } from '../error/password-previously-used';
import { RateLimitError } from '../error/rate-limit-error';

export interface ICreateUser {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    rootRole: number | RoleName;
}

export interface IUpdateUser {
    id: number;
    name?: string;
    email?: string;
    rootRole?: number | RoleName;
}

export interface ILoginUserRequest {
    email: string;
    name?: string;
    rootRole?: number | RoleName;
    autoCreate?: boolean;
}

const saltRounds = 10;
const disallowNPreviousPasswords = 5;

class UserService {
    private logger: Logger;

    private store: IUserStore;

    private eventService: EventService;

    private accessService: AccessService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    private emailService: EmailService;

    private settingService: SettingService;

    private passwordResetTimeouts: { [key: string]: NodeJS.Timeout } = {};

    private baseUriPath: string;

    readonly unleashUrl: string;

    constructor(
        stores: Pick<IUnleashStores, 'userStore'>,
        {
            server,
            getLogger,
            authentication,
        }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'server'>,
        services: {
            accessService: AccessService;
            resetTokenService: ResetTokenService;
            emailService: EmailService;
            eventService: EventService;
            sessionService: SessionService;
            settingService: SettingService;
        },
    ) {
        this.logger = getLogger('service/user-service.js');
        this.store = stores.userStore;
        this.eventService = services.eventService;
        this.accessService = services.accessService;
        this.resetTokenService = services.resetTokenService;
        this.emailService = services.emailService;
        this.sessionService = services.sessionService;
        this.settingService = services.settingService;

        process.nextTick(() => this.initAdminUser(authentication));

        this.baseUriPath = server.baseUriPath || '';
        this.unleashUrl = server.unleashUrl;
    }

    validatePassword(password: string): boolean {
        if (password) {
            const result = owasp.test(password);
            if (!result.strong) {
                throw new OwaspValidationError(result);
            } else return true;
        } else {
            throw new PasswordUndefinedError();
        }
    }

    async initAdminUser({
        createAdminUser,
        initialAdminUser,
    }: Pick<
        IAuthOption,
        'createAdminUser' | 'initialAdminUser'
    >): Promise<void> {
        if (!createAdminUser) return Promise.resolve();

        return this.initAdminUsernameUser(initialAdminUser);
    }

    async initAdminUsernameUser(
        usernameAdminUser?: UsernameAdminUser,
    ): Promise<void> {
        const username = usernameAdminUser?.username || 'admin';
        const password = usernameAdminUser?.password || 'unleash4all';

        const userCount = await this.store.count();

        if (userCount === 0) {
            // create default admin user
            try {
                this.logger.info(
                    `Creating default admin user, with username '${username}' and password '${password}'`,
                );
                const user = await this.store.insert({
                    username,
                });
                const passwordHash = await bcrypt.hash(password, saltRounds);
                await this.store.setPasswordHash(
                    user.id,
                    passwordHash,
                    disallowNPreviousPasswords,
                );
                await this.accessService.setUserRootRole(
                    user.id,
                    RoleName.ADMIN,
                );
            } catch (e) {
                this.logger.error(
                    `Unable to create default user '${username}'`,
                );
            }
        }
    }

    async getAll(): Promise<IUserWithRootRole[]> {
        const users = await this.store.getAll();
        const defaultRole = await this.accessService.getPredefinedRole(
            RoleName.VIEWER,
        );
        const userRoles = await this.accessService.getRootRoleForAllUsers();
        const usersWithRootRole = users.map((u) => {
            const rootRole = userRoles.find((r) => r.userId === u.id);
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...u, rootRole: roleId };
        });
        return usersWithRootRole;
    }

    async getUser(id: number): Promise<IUserWithRootRole> {
        const user = await this.store.get(id);
        const rootRole = await this.accessService.getRootRoleForUser(id);
        return { ...user, rootRole: rootRole.id };
    }

    async search(query: string): Promise<IUser[]> {
        return this.store.search(query);
    }

    async getByEmail(email: string): Promise<IUser> {
        return this.store.getByQuery({ email });
    }

    async createUser(
        { username, email, name, password, rootRole }: ICreateUser,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<IUserWithRootRole> {
        if (!username && !email) {
            throw new BadDataError('You must specify username or email');
        }

        if (email) {
            Joi.assert(
                email,
                Joi.string().email({ ignoreLength: true }),
                'Email',
            );
        }

        const exists = await this.store.hasUser({ username, email });
        if (exists) {
            throw new BadDataError('User already exists');
        }

        const user = await this.store.insert({
            username,
            email,
            name,
        });

        await this.accessService.setUserRootRole(user.id, rootRole);

        if (password) {
            const passwordHash = await bcrypt.hash(password, saltRounds);
            await this.store.setPasswordHash(
                user.id,
                passwordHash,
                disallowNPreviousPasswords,
            );
        }

        const userCreated = await this.getUser(user.id);

        await this.eventService.storeEvent(
            new UserCreatedEvent({
                auditUser,
                userCreated,
            }),
        );

        return userCreated;
    }

    async newUserInviteLink(
        user: IUserWithRootRole,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<string> {
        const passwordAuthSettings =
            await this.settingService.getWithDefault<SimpleAuthSettings>(
                simpleAuthSettingsKey,
                { disabled: false },
            );

        let inviteLink = this.unleashUrl;
        if (!passwordAuthSettings.disabled) {
            const inviteUrl = await this.resetTokenService.createNewUserUrl(
                user.id,
                auditUser.username,
            );
            inviteLink = inviteUrl.toString();
        }
        return inviteLink;
    }

    async sendWelcomeEmail(
        user: IUserWithRootRole,
        inviteLink: string,
    ): Promise<boolean> {
        let emailSent = false;
        const emailConfigured = this.emailService.configured();

        if (emailConfigured && user.email) {
            try {
                await this.emailService.sendGettingStartedMail(
                    user.name || '',
                    user.email,
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

        return emailSent;
    }

    async updateUser(
        { id, name, email, rootRole }: IUpdateUser,
        auditUser: IAuditUser,
    ): Promise<IUserWithRootRole> {
        const preUser = await this.getUser(id);

        if (email) {
            Joi.assert(
                email,
                Joi.string().email({ ignoreLength: true }),
                'Email',
            );
        }

        if (rootRole) {
            await this.accessService.setUserRootRole(id, rootRole);
        }

        const payload: Partial<IUser> = {
            name: name || preUser.name,
            email: email || preUser.email,
        };

        // Empty updates will throw, so make sure we have something to update.
        const user = Object.values(payload).some(isDefined)
            ? await this.store.update(id, payload)
            : preUser;

        const storedUser = await this.getUser(user.id);

        await this.eventService.storeEvent(
            new UserUpdatedEvent({
                auditUser,
                preUser: preUser,
                postUser: storedUser,
            }),
        );

        return storedUser;
    }

    async deleteUser(userId: number, auditUser: IAuditUser): Promise<void> {
        const user = await this.getUser(userId);
        await this.accessService.wipeUserPermissions(userId);
        await this.sessionService.deleteSessionsForUser(userId);

        await this.store.delete(userId);

        await this.eventService.storeEvent(
            new UserDeletedEvent({
                deletedUser: user,
                auditUser,
            }),
        );
    }

    async loginUser(usernameOrEmail: string, password: string): Promise<IUser> {
        const settings = await this.settingService.get<SimpleAuthSettings>(
            simpleAuthSettingsKey,
        );

        if (settings?.disabled) {
            throw new DisabledError(
                'Logging in with username/password has been disabled.',
            );
        }

        const idQuery = isEmail(usernameOrEmail)
            ? { email: usernameOrEmail }
            : { username: usernameOrEmail };

        let user: IUser | undefined, passwordHash: string | undefined;
        try {
            user = await this.store.getByQuery(idQuery);
            passwordHash = await this.store.getPasswordHash(user.id);
        } catch (error) {}
        if (user && passwordHash) {
            const match = await bcrypt.compare(password, passwordHash);
            if (match) {
                await this.store.successfullyLogin(user);
                return user;
            }
        }
        throw new PasswordMismatch(
            `The combination of password and username you provided is invalid. If you have forgotten your password, visit ${this.baseUriPath}/forgotten-password or get in touch with your instance administrator.`,
        );
    }

    /**
     * Used to login users without specifying password. Used when integrating
     * with external identity providers.
     *
     * @param usernameOrEmail
     * @param autoCreateUser
     * @returns
     */
    async loginUserWithoutPassword(
        email: string,
        autoCreateUser: boolean = false,
    ): Promise<IUser> {
        return this.loginUserSSO({ email, autoCreate: autoCreateUser });
    }

    async loginUserSSO({
        email,
        name,
        rootRole,
        autoCreate = false,
    }: ILoginUserRequest): Promise<IUser> {
        let user: IUser;

        try {
            user = await this.store.getByQuery({ email });
            // Update user if autCreate is enabled.
            if (name && user.name !== name) {
                user = await this.store.update(user.id, { name, email });
            }
        } catch (e) {
            // User does not exists. Create if 'autoCreate' is enabled
            if (autoCreate) {
                user = await this.createUser(
                    {
                        email,
                        name,
                        rootRole: rootRole || RoleName.EDITOR,
                    },
                    SYSTEM_USER_AUDIT,
                );
            } else {
                throw e;
            }
        }
        await this.store.successfullyLogin(user);
        return user;
    }

    async loginDemoAuthDefaultAdmin(): Promise<IUser> {
        const user = await this.store.getByQuery({ id: 1 });
        await this.store.successfullyLogin(user);
        return user;
    }

    async changePassword(userId: number, password: string): Promise<void> {
        this.validatePassword(password);
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await this.store.setPasswordHash(
            userId,
            passwordHash,
            disallowNPreviousPasswords,
        );
        await this.sessionService.deleteSessionsForUser(userId);
        await this.resetTokenService.expireExistingTokensForUser(userId);
    }

    async changePasswordWithPreviouslyUsedPasswordCheck(
        userId: number,
        password: string,
    ): Promise<void> {
        const previouslyUsed =
            await this.store.getPasswordsPreviouslyUsed(userId);
        const usedBefore = previouslyUsed.some((previouslyUsed) =>
            bcrypt.compareSync(password, previouslyUsed),
        );
        if (usedBefore) {
            throw new PasswordPreviouslyUsedError();
        }

        await this.changePassword(userId, password);
    }

    async changePasswordWithVerification(
        userId: number,
        newPassword: string,
        oldPassword: string,
    ): Promise<void> {
        const currentPasswordHash = await this.store.getPasswordHash(userId);
        const match = await bcrypt.compare(oldPassword, currentPasswordHash);
        if (!match) {
            throw new PasswordMismatch(
                `The old password you provided is invalid. If you have forgotten your password, visit ${this.baseUriPath}/forgotten-password or get in touch with your instance administrator.`,
            );
        }

        await this.changePasswordWithPreviouslyUsedPasswordCheck(
            userId,
            newPassword,
        );
    }

    async getUserForToken(token: string): Promise<TokenUserSchema> {
        const { createdBy, userId } =
            await this.resetTokenService.isValid(token);
        const user = await this.getUser(userId);
        const role = await this.accessService.getRoleData(user.rootRole);
        return {
            token,
            createdBy,
            email: user.email,
            name: user.name,
            id: user.id,
            role: {
                id: user.rootRole,
                description: role.role.description,
                type: role.role.type,
                name: role.role.name,
            },
        };
    }

    /**
     * If the password is a strong password will update password and delete all sessions for the user we're changing the password for
     * @param token - the token authenticating this request
     * @param password - new password
     */
    async resetPassword(token: string, password: string): Promise<void> {
        this.validatePassword(password);
        const user = await this.getUserForToken(token);

        await this.changePasswordWithPreviouslyUsedPasswordCheck(
            user.id,
            password,
        );

        await this.resetTokenService.useAccessToken({
            userId: user.id,
            token,
        });
    }

    async createResetPasswordEmail(
        receiverEmail: string,
        user: IUser = new User({
            id: SYSTEM_USER.id,
            username: SYSTEM_USER.username,
        }),
    ): Promise<URL> {
        const receiver = await this.getByEmail(receiverEmail);
        if (!receiver) {
            throw new NotFoundError(`Could not find ${receiverEmail}`);
        }
        if (this.passwordResetTimeouts[receiver.id]) {
            throw new RateLimitError(
                'You can only send one new reset password email per minute, per user. Please try again later.',
            );
        }

        const resetLink = await this.resetTokenService.createResetPasswordUrl(
            receiver.id,
            user.username || user.email,
        );

        this.passwordResetTimeouts[receiver.id] = setTimeout(() => {
            delete this.passwordResetTimeouts[receiver.id];
        }, 1000 * 60); // 1 minute

        await this.emailService.sendResetMail(
            receiver.name,
            receiver.email,
            resetLink.toString(),
        );
        return resetLink;
    }
}

export default UserService;
