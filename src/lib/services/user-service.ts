import assert from 'assert';
import bcrypt from 'bcrypt';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import UserStore, { IUserSearch } from '../db/user-store';
import { Logger } from '../logger';
import { IUnleashConfig } from '../types/core';
import User, { IUser } from '../user';
import isEmail from '../util/is-email';
import { AccessService, RoleName } from './access-service';
import { ADMIN } from '../permissions';
import ResetTokenService from './reset-token-service';
import InvalidTokenError from '../error/invalid-token-error';
import NotFoundError from '../error/notfound-error';
import OwaspValidationError from '../error/owasp-validation-error';
import { URL } from 'url';
import { EmailService } from './email-service';

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

interface ITokenUser extends IUpdateUser {
    createdBy: string;
    token: string;
}

interface IStores {
    userStore: UserStore;
}

interface IServices {
    accessService: AccessService;
    resetTokenService: ResetTokenService;
    emailService: EmailService;
}

const saltRounds = 10;

class UserService {
    private logger: Logger;

    private store: UserStore;

    private accessService: AccessService;

    private resetTokenService: ResetTokenService;

    private emailService: EmailService;

    constructor(
        stores: IStores,
        config: IUnleashConfig,
        { accessService, resetTokenService, emailService }: IServices,
    ) {
        this.logger = config.getLogger('service/user-service.js');
        this.store = stores.userStore;
        this.accessService = accessService;
        this.resetTokenService = resetTokenService;
        this.emailService = emailService;
        if (config.authentication && config.authentication.createAdminUser) {
            process.nextTick(() => this.initAdminUser());
        }
    }

    validatePassword(password: string): boolean {
        const result = owasp.test(password);
        if (!result.strong) {
            throw new OwaspValidationError(result.errors[0]);
        } else return true;
    }

    async initAdminUser(): Promise<void> {
        const hasAdminUser = await this.store.hasUser({ username: 'admin' });

        if (!hasAdminUser) {
            // create default admin user
            try {
                this.logger.info(
                    'Creating default user "admin" with password "admin"',
                );
                const user = await this.store.insert(
                    new User({
                        username: 'admin',
                        permissions: [ADMIN], // TODO: remove in v4
                    }),
                );
                const passwordHash = await bcrypt.hash('admin', saltRounds);
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
        const defaultRole = await this.accessService.getRootRole(RoleName.VIEWER);
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
        const defaultRole = await this.accessService.getRootRole(RoleName.VIEWER);
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

    async createUser({
        username,
        email,
        name,
        password,
        rootRole,
    }: ICreateUser): Promise<User> {
        assert.ok(username || email, 'You must specify username or email');

        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
        }

        const exists = await this.store.hasUser({ username, email });
        if (exists) {
            throw new Error('User already exists');
        }

        const user = await this.store.insert(
            // TODO: remove permission in v4.
            new User({ username, email, name, permissions: [ADMIN] }),
        );

        await this.accessService.setUserRootRole(user.id, rootRole);

        if (password) {
            const passwordHash = await bcrypt.hash(password, saltRounds);
            await this.store.setPasswordHash(user.id, passwordHash);
        }

        return user;
    }

    async updateUser({
        id,
        name,
        email,
        rootRole,
    }: IUpdateUser): Promise<User> {
        if (email) {
            Joi.assert(email, Joi.string().email(), 'Email');
        }

        if (rootRole) {
            await this.accessService.setUserRootRole(id, rootRole);
        }

        return this.store.update(id, { name, email });
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

    async deleteUser(userId: number): Promise<void> {
        const roles = await this.accessService.getRolesForUser(userId);
        await Promise.all(
            roles.map(role =>
                this.accessService.removeUserFromRole(userId, role.id),
            ),
        );

        await this.store.delete(userId);
    }

    async getUserForToken(token: string): Promise<ITokenUser> {
        const { createdBy, userId } = await this.resetTokenService.isValid(
            token,
        );
        const user = await this.getUser(userId);
        return {
            token,
            createdBy,
            email: user.email,
            name: user.name,
            id: user.id,
        };
    }

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
        requester: string,
    ): Promise<void> {
        const receiver = await this.getByEmail(receiverEmail);
        if (!receiver) {
            throw new NotFoundError(`Could not find ${receiverEmail}`);
        }
        const resetLink = await this.resetTokenService.createResetPasswordUrl(
            receiver.id,
            requester,
        );

        this.emailService.sendResetMail(
            receiver.name,
            receiver.email,
            resetLink.toString(),
        );
    }
}

module.exports = UserService;
export default UserService;
