import assert from 'assert';
import bcrypt from 'bcrypt';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import { URL } from 'url';
import UserStore, { IUserSearch } from '../db/user-store';
import { Logger } from '../logger';
import User, { IUser } from '../types/user';
import isEmail from '../util/is-email';
import { AccessService, RoleName } from './access-service';
import ResetTokenService from './reset-token-service';
import InvalidTokenError from '../error/invalid-token-error';
import NotFoundError from '../error/notfound-error';
import OwaspValidationError from '../error/owasp-validation-error';
import { EmailService } from './email-service';
import { IUnleashConfig } from '../types/option';
import SessionService from './session-service';
import { IUnleashServices } from '../types/services';
import { IUnleashStores } from '../types/stores';
import PasswordUndefinedError from '../error/password-undefined';
import EventStore from '../db/event-store';
import { USER_UPDATED, USER_CREATED, USER_DELETED } from '../types/events';

const systemUser = new User({ id: -1, username: 'system' });

export interface ICreateUser {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    rootRole: number;
}

export interface IUpdateUser {
    id: number;
    name?: string;
    email?: string;
    rootRole?: number;
}

interface IUserWithRole extends IUser {
    rootRole: number;
}
interface IRoleDescription {
    description: string;
    name: string;
    type: string;
}
interface ITokenUser extends IUpdateUser {
    createdBy: string;
    token: string;
    role: IRoleDescription;
}

const saltRounds = 10;

class UserService {
    private logger: Logger;

    private store: UserStore;

    private eventStore: EventStore;

    private accessService: AccessService;

    private resetTokenService: ResetTokenService;

    private sessionService: SessionService;

    private emailService: EmailService;

    constructor(
        stores: Pick<IUnleashStores, 'userStore' | 'eventStore'>,
        {
            getLogger,
            authentication,
        }: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
        {
            accessService,
            resetTokenService,
            emailService,
            sessionService,
        }: Pick<
        IUnleashServices,
            | 'accessService'
            | 'resetTokenService'
            | 'emailService'
            | 'sessionService'
        >,
    ) {
        this.logger = getLogger('service/user-service.js');
        this.store = stores.userStore;
        this.eventStore = stores.eventStore;
        this.accessService = accessService;
        this.resetTokenService = resetTokenService;
        this.emailService = emailService;
        this.sessionService = sessionService;
        if (authentication && authentication.createAdminUser) {
            process.nextTick(() => this.initAdminUser());
        }
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

    async initAdminUser(): Promise<void> {
        const hasAdminUser = await this.store.hasUser({ username: 'admin' });

        if (!hasAdminUser) {
            // create default admin user
            try {
                const pwd = 'unleash4all';
                this.logger.info(
                    `Creating default user "admin" with password "${pwd}"`,
                );
                const user = await this.store.insert({
                    username: 'admin',
                });
                const passwordHash = await bcrypt.hash(pwd, saltRounds);
                await this.store.setPasswordHash(user.id, passwordHash);

                const rootRoles = await this.accessService.getRootRoles();
                const adminRole = rootRoles.find(
                    r => r.name === RoleName.ADMIN,
                );
                await this.accessService.setUserRootRole(user.id, adminRole.id);
            } catch (e) {
                this.logger.error('Unable to create default user "admin"');
            }
        }
    }

    async getAll(): Promise<IUserWithRole[]> {
        const users = await this.store.getAll();
        const defaultRole = await this.accessService.getRootRole(
            RoleName.VIEWER,
        );
        const userRoles = await this.accessService.getRootRoleForAllUsers();
        const usersWithRootRole = users.map(u => {
            const rootRole = userRoles.find(r => r.userId === u.id);
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...u, rootRole: roleId };
        });
        return usersWithRootRole;
    }

    async getUser(id: number): Promise<IUserWithRole> {
        const roles = await this.accessService.getUserRootRoles(id);
        const defaultRole = await this.accessService.getRootRole(
            RoleName.VIEWER,
        );
        const roleId = roles.length > 0 ? roles[0].id : defaultRole.id;
        const user = await this.store.get({ id });
        return { ...user, rootRole: roleId };
    }

    async search(query: IUserSearch): Promise<User[]> {
        return this.store.search(query);
    }

    async getByEmail(email: string): Promise<User> {
        return this.store.get({ email });
    }

    async createUser(
        { username, email, name, password, rootRole }: ICreateUser,
        updatedBy?: User,
    ): Promise<User> {
        assert.ok(username || email, 'You must specify username or email');

        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
        }

        const exists = await this.store.hasUser({ username, email });
        if (exists) {
            throw new Error('User already exists');
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

        await this.updateChangeLog(USER_CREATED, user, updatedBy);

        return user;
    }

    private async updateChangeLog(
        type: string,
        user: User,
        updatedBy: User = systemUser,
    ): Promise<void> {
        await this.eventStore.store({
            type,
            createdBy: updatedBy.username || updatedBy.email,
            data: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
        });
    }

    async updateUser(
        { id, name, email, rootRole }: IUpdateUser,
        updatedBy?: User,
    ): Promise<User> {
        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
        }

        if (rootRole) {
            await this.accessService.setUserRootRole(id, rootRole);
        }

        const user = await this.store.update(id, { name, email });

        await this.updateChangeLog(USER_UPDATED, user, updatedBy);

        return user;
    }

    async loginUser(usernameOrEmail: string, password: string): Promise<User> {
        const idQuery = isEmail(usernameOrEmail)
            ? { email: usernameOrEmail }
            : { username: usernameOrEmail };
        const user = await this.store.get(idQuery);
        const passwordHash = await this.store.getPasswordHash(user.id);

        const match = await bcrypt.compare(password, passwordHash);
        if (match) {
            await this.store.successfullyLogin(user);
            return user;
        }
        throw new Error('Wrong password, try again.');
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
    ): Promise<User> {
        let user: User;

        try {
            user = await this.store.get({ email });
        } catch (e) {
            if (autoCreateUser) {
                const defaultRole = await this.accessService.getRootRole(
                    RoleName.EDITOR,
                );
                user = await this.createUser({
                    email,
                    rootRole: defaultRole.id,
                });
            } else {
                throw e;
            }
        }
        this.store.successfullyLogin(user);
        return user;
    }

    async changePassword(userId: number, password: string): Promise<void> {
        this.validatePassword(password);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        return this.store.setPasswordHash(userId, passwordHash);
    }

    async deleteUser(userId: number, updatedBy?: User): Promise<void> {
        const user = await this.store.get({ id: userId });
        const roles = await this.accessService.getRolesForUser(userId);
        await Promise.all(
            roles.map(role =>
                this.accessService.removeUserFromRole(userId, role.id),
            ),
        );
        await this.sessionService.deleteSessionsForUser(userId);

        await this.store.delete(userId);

        await this.updateChangeLog(USER_DELETED, user, updatedBy);
    }

    async getUserForToken(token: string): Promise<ITokenUser> {
        const { createdBy, userId } = await this.resetTokenService.isValid(
            token,
        );
        const user = await this.getUser(userId);
        const role = await this.accessService.getRole(user.rootRole);
        return {
            token,
            createdBy,
            email: user.email,
            name: user.name,
            id: user.id,
            role: {
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
            await this.sessionService.deleteSessionsForUser(user.id);
        } else {
            throw new InvalidTokenError();
        }
    }

    async createResetPasswordEmail(
        receiverEmail: string,
        user: User = systemUser,
    ): Promise<URL> {
        const receiver = await this.getByEmail(receiverEmail);
        if (!receiver) {
            throw new NotFoundError(`Could not find ${receiverEmail}`);
        }
        const resetLink = await this.resetTokenService.createResetPasswordUrl(
            receiver.id,
            user.username || user.email,
        );

        await this.emailService.sendResetMail(
            receiver.name,
            receiver.email,
            resetLink.toString(),
        );
        return resetLink;
    }
}

module.exports = UserService;
export default UserService;
