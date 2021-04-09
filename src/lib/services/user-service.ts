import assert from 'assert';
import bcrypt from 'bcrypt';
import owasp from 'owasp-password-strength-test';
import Joi from 'joi';

import UserStore, { IUserLookup, IUserSearch } from '../db/user-store';
import { Logger } from '../logger';
import { IUnleashConfig } from '../types/core';
import User, { IUser } from '../user';
import isEmail from '../util/is-email';
import { AccessService, RoleName } from './access-service';
import { ADMIN } from '../permissions';

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

interface IStores {
    userStore: UserStore;
}

const saltRounds = 10;

class UserService {
    private logger: Logger;

    private store: UserStore;

    private accessService: AccessService;

    private defaultRole: RoleName = RoleName.REGULAR;

    constructor(
        stores: IStores,
        config: IUnleashConfig,
        accessService: AccessService,
    ) {
        this.logger = config.getLogger('service/user-service.js');
        this.store = stores.userStore;
        this.accessService = accessService;
        this.defaultRole = this.accessService.RoleName.REGULAR;

        if (config.authentication && config.authentication.createAdminUser) {
            process.nextTick(() => this.initAdminUser());
        }
    }

    validatePassword(password: string): boolean {
        const result = owasp.test(password);
        if (!result.strong) {
            throw new Error(result.errors[0]);
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
        const defaultRole = await this.accessService.getRootRole(RoleName.READ);
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
        const defaultRole = await this.accessService.getRootRole(RoleName.READ);
        const roleId = roles.length > 0 ? roles[0].id : defaultRole.id;
        const user = await this.store.get({ id });
        return { ...user, rootRole: roleId };
    }

    async findUser({ email, username }: IUserLookup): Promise<User> {
        return this.store.get({ email, username });
    }

    async search(query: IUserSearch): Promise<User[]> {
        return this.store.search(query);
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
            new User({ username, email, name }),
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
}

module.exports = UserService;
export default UserService;
