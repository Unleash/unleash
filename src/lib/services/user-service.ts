import bcrypt from 'bcryptjs';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import type { URL } from 'url';
import type { Logger } from '../logger.js';
import User, {
    type IAuditUser,
    type IUser,
    type IUserWithRootRole,
} from '../types/user.js';
import isEmail from '../util/is-email.js';
import type { AccessService } from './access-service.js';
import type ResetTokenService from './reset-token-service.js';
import NotFoundError from '../error/notfound-error.js';
import OwaspValidationError from '../error/owasp-validation-error.js';
import type { EmailService } from './email-service.js';
import type {
    IAuthOption,
    IUnleashConfig,
    UsernameAdminUser,
} from '../types/option.js';
import type SessionService from './session-service.js';
import type { IUnleashStores } from '../types/stores.js';
import PasswordUndefinedError from '../error/password-undefined.js';
import {
    ScimUsersDeleted,
    UserCreatedEvent,
    UserDeletedEvent,
    UserUpdatedEvent,
} from '../types/index.js';
import type { IUserStore } from '../types/index.js';
import { RoleName } from '../types/model.js';
import type SettingService from './setting-service.js';
import {
    type SimpleAuthSettings,
    simpleAuthSettingsKey,
} from '../types/settings/simple-auth-settings.js';
import DisabledError from '../error/disabled-error.js';
import BadDataError from '../error/bad-data-error.js';
import { isDefined } from '../util/index.js';
import type { TokenUserSchema } from '../openapi/index.js';
import PasswordMismatch from '../error/password-mismatch.js';
import type EventService from '../features/events/event-service.js';

import {
    type IFlagResolver,
    SYSTEM_USER,
    SYSTEM_USER_AUDIT,
} from '../types/index.js';
import { PasswordPreviouslyUsedError } from '../error/password-previously-used.js';
import { RateLimitError } from '../error/rate-limit-error.js';
import type EventEmitter from 'events';
import { USER_LOGIN } from '../metric-events.js';

export interface ICreateUserWithRole {
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

export class UserService {
    private logger: Logger;

    private store: IUserStore;

    private eventService: EventService;

    private eventBus: EventEmitter;

    private accessService: AccessService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    private emailService: EmailService;

    private settingService: SettingService;

    private flagResolver: IFlagResolver;

    private passwordResetTimeouts: { [key: string]: NodeJS.Timeout } = {};

    private baseUriPath: string;

    readonly unleashUrl: string;

    readonly maxParallelSessions: number;

    constructor(
        stores: Pick<IUnleashStores, 'userStore'>,
        {
            server,
            getLogger,
            eventBus,
            flagResolver,
            session,
        }: Pick<
            IUnleashConfig,
            'getLogger' | 'server' | 'eventBus' | 'flagResolver' | 'session'
        >,
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
        this.eventBus = eventBus;
        this.eventService = services.eventService;
        this.accessService = services.accessService;
        this.resetTokenService = services.resetTokenService;
        this.emailService = services.emailService;
        this.sessionService = services.sessionService;
        this.settingService = services.settingService;
        this.flagResolver = flagResolver;
        this.maxParallelSessions = session.maxParallelSessions;
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
            } catch (_e) {
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
        if (this.flagResolver.isEnabled('showUserDeviceCount')) {
            const sessionCounts = await this.sessionService.getSessionsCount();
            const usersWithSessionCounts = usersWithRootRole.map((u) => ({
                ...u,
                activeSessions: sessionCounts[u.id] || 0,
            }));
            return usersWithSessionCounts;
        }

        return usersWithRootRole;
    }

    async getUser(id: number): Promise<IUserWithRootRole> {
        const user = await this.store.get(id);
        if (user === undefined) {
            throw new NotFoundError(`Could not find user with id ${id}`);
        }
        const rootRole = await this.accessService.getRootRoleForUser(id);
        return { ...user, id, rootRole: rootRole.id };
    }

    async search(query: string): Promise<IUser[]> {
        return this.store.search(query);
    }

    async getByEmail(email: string): Promise<IUser> {
        return this.store.getByQuery({ email });
    }

    private validateEmail(email?: string): void {
        if (email) {
            Joi.assert(
                email,
                Joi.string().email({
                    ignoreLength: true,
                    minDomainSegments: 1,
                }),
                'Email',
            );
        }
    }

    async createUser(
        { username, email, name, password, rootRole }: ICreateUserWithRole,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<IUserWithRootRole> {
        if (!username && !email) {
            throw new BadDataError('You must specify username or email');
        }

        Joi.assert(name, Joi.string(), 'Name');

        this.validateEmail(email);

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
        { id: userId }: Pick<IUserWithRootRole, 'id'>,
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
                userId,
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

        this.validateEmail(email);

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

    async deleteScimUsers(auditUser: IAuditUser): Promise<void> {
        const users = await this.store.deleteScimUsers();
        // Note: after deletion we can't get the role for the user. This is a simplification
        const viewerRole = await this.accessService.getPredefinedRole(
            RoleName.VIEWER,
        );
        if (users.length > 0) {
            const deletions = users.map((user) => {
                return new UserDeletedEvent({
                    deletedUser: { ...user, rootRole: viewerRole.id },
                    auditUser,
                });
            });
            await this.eventService.storeEvents([
                ...deletions,
                new ScimUsersDeleted({
                    data: null,
                    auditUser,
                }),
            ]);
        }
    }

    async loginUser(
        usernameOrEmail: string,
        password: string,
        device?: { userAgent?: string; ip: string },
    ): Promise<IUser> {
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
        } catch (_error) {}
        if (user && passwordHash) {
            const match = await bcrypt.compare(password, passwordHash);
            if (match) {
                const loginOrder = await this.store.successfullyLogin(user);

                const sessions = await this.sessionService.getSessionsForUser(
                    user.id,
                );
                if (sessions.length >= 5 && device) {
                    this.logger.info(
                        `Excessive login (user id: ${user.id}, user agent: ${device.userAgent}, IP: ${device.ip})`,
                    );
                }

                // subtract current user session that will be created
                const deletedSessionsCount =
                    await this.sessionService.deleteStaleSessionsForUser(
                        user.id,
                        Math.max(this.maxParallelSessions - 1, 0),
                    );
                user.deletedSessions = deletedSessionsCount;
                user.activeSessions = this.maxParallelSessions;

                this.eventBus.emit(USER_LOGIN, { loginOrder });
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
            // Update user if not managed by scim
            if (name && user.name !== name && !user.scimId) {
                const currentRole = await this.accessService.getRootRoleForUser(
                    user.id,
                );
                const updatedUser = await this.store.update(user.id, {
                    name,
                    email,
                });

                await this.eventService.storeEvent(
                    new UserUpdatedEvent({
                        auditUser: SYSTEM_USER_AUDIT,
                        preUser: {
                            ...user,
                            rootRole: currentRole.id,
                        },
                        postUser: {
                            ...updatedUser,
                            rootRole: currentRole.id,
                        },
                    }),
                );
                user = { ...user, ...updatedUser };
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
        const loginOrder = await this.store.successfullyLogin(user);
        this.eventBus.emit(USER_LOGIN, { loginOrder });
        return user;
    }

    async loginDemoAuthDefaultAdmin(): Promise<IUser> {
        const user = await this.store.getByQuery({ id: 1 });
        const loginOrder = await this.store.successfullyLogin(user);
        this.eventBus.emit(USER_LOGIN, { loginOrder });
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
            email: user.email!,
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
            user.username || user.email || SYSTEM_USER_AUDIT.username,
        );

        this.passwordResetTimeouts[receiver.id] = setTimeout(() => {
            delete this.passwordResetTimeouts[receiver.id];
        }, 1000 * 60); // 1 minute

        await this.emailService.sendResetMail(
            receiver.name!,
            receiverEmail,
            resetLink.toString(),
        );
        return resetLink;
    }
}

export default UserService;
