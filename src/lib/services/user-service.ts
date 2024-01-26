import bcrypt from 'bcryptjs';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import { URL } from 'url';
import { Logger } from '../logger';
import User, { IUser, IUserWithRootRole } from '../types/user';
import isEmail from '../util/is-email';
import { AccessService } from './access-service';
import ResetTokenService from './reset-token-service';
import InvalidTokenError from '../error/invalid-token-error';
import NotFoundError from '../error/notfound-error';
import OwaspValidationError from '../error/owasp-validation-error';
import { EmailService } from './email-service';
import { IAuthOption, IUnleashConfig } from '../types/option';
import SessionService from './session-service';
import { IUnleashStores } from '../types/stores';
import PasswordUndefinedError from '../error/password-undefined';
import {
    UserCreatedEvent,
    UserUpdatedEvent,
    UserDeletedEvent,
} from '../types/events';
import { IUserStore } from '../types/stores/user-store';
import { RoleName } from '../types/model';
import SettingService from './setting-service';
import { SimpleAuthSettings } from '../server-impl';
import { simpleAuthSettingsKey } from '../types/settings/simple-auth-settings';
import DisabledError from '../error/disabled-error';
import BadDataError from '../error/bad-data-error';
import { isDefined } from '../util/isDefined';
import { TokenUserSchema } from '../openapi/spec/token-user-schema';
import PasswordMismatch from '../error/password-mismatch';
import EventService from '../features/events/event-service';

import { SYSTEM_USER } from '../types';

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

        if (authentication.createAdminUser !== false) {
            process.nextTick(() =>
                this.initAdminUser({
                    createAdminUser: authentication.createAdminUser,
                    initialAdminUser: authentication.initialAdminUser,
                }),
            );
        }

        this.baseUriPath = server.baseUriPath || '';
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

    async initAdminUser(
        initialAdminUserConfig: Pick<
            IAuthOption,
            'createAdminUser' | 'initialAdminUser'
        >,
    ): Promise<void> {
        let username: string;
        let password: string;

        if (
            initialAdminUserConfig.createAdminUser !== false &&
            initialAdminUserConfig.initialAdminUser
        ) {
            username = initialAdminUserConfig.initialAdminUser.username;
            password = initialAdminUserConfig.initialAdminUser.password;
        } else {
            username = 'admin';
            password = 'unleash4all';
        }

        const userCount = await this.store.count();

        if (userCount === 0 && username && password) {
            // create default admin user
            try {
                this.logger.info(
                    `Creating default user '${username}' with password '${password}'`,
                );
                const user = await this.store.insert({
                    username,
                });
                const passwordHash = await bcrypt.hash(password, saltRounds);
                await this.store.setPasswordHash(user.id, passwordHash);
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
        updatedBy?: IUser,
    ): Promise<IUserWithRootRole> {
        if (!username && !email) {
            throw new BadDataError('You must specify username or email');
        }

        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
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
            await this.store.setPasswordHash(user.id, passwordHash);
        }

        const userCreated = await this.getUser(user.id);

        await this.eventService.storeEvent(
            new UserCreatedEvent({
                createdBy: this.getCreatedBy(updatedBy),
                createdByUserId: user.id,
                userCreated,
            }),
        );

        return userCreated;
    }

    private getCreatedBy(updatedBy: IUser = new User(SYSTEM_USER)): string {
        return updatedBy.username || updatedBy.email;
    }

    async updateUser(
        { id, name, email, rootRole }: IUpdateUser,
        updatedBy?: IUser,
    ): Promise<IUserWithRootRole> {
        const preUser = await this.getUser(id);

        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
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
                createdBy: this.getCreatedBy(updatedBy),
                preUser: preUser,
                postUser: storedUser,
                createdByUserId: user.id,
            }),
        );

        return storedUser;
    }

    async deleteUser(userId: number, updatedBy?: IUser): Promise<void> {
        const user = await this.getUser(userId);
        await this.accessService.wipeUserPermissions(userId);
        await this.sessionService.deleteSessionsForUser(userId);

        await this.store.delete(userId);

        await this.eventService.storeEvent(
            new UserDeletedEvent({
                createdBy: this.getCreatedBy(updatedBy),
                deletedUser: user,
                createdByUserId: updatedBy?.id || -1337,
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
                user = await this.createUser({
                    email,
                    name,
                    rootRole: rootRole || RoleName.EDITOR,
                });
            } else {
                throw e;
            }
        }
        await this.store.successfullyLogin(user);
        return user;
    }

    async changePassword(userId: number, password: string): Promise<void> {
        this.validatePassword(password);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        await this.store.setPasswordHash(userId, passwordHash);
        await this.sessionService.deleteSessionsForUser(userId);
        await this.resetTokenService.expireExistingTokensForUser(userId);
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

        await this.changePassword(userId, newPassword);
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
        const allowed = await this.resetTokenService.useAccessToken({
            userId: user.id,
            token,
        });
        if (allowed) {
            await this.changePassword(user.id, password);
        } else {
            throw new InvalidTokenError();
        }
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
            return;
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
