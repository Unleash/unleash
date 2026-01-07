import {
    ADMIN_TOKEN_USER,
    type IAccessStore,
    type IUnleashStores,
    RoleType,
    SYSTEM_USER_ID,
} from '../../types/index.js';
import type { IAccessReadModel } from './access-read-model-type.js';
import * as permissions from '../../types/permissions.js';

const { ADMIN } = permissions;

export class AccessReadModel implements IAccessReadModel {
    private store: IAccessStore;

    constructor({ accessStore }: Pick<IUnleashStores, 'accessStore'>) {
        this.store = accessStore;
    }

    async isRootAdmin(userId: number): Promise<boolean> {
        if (userId === SYSTEM_USER_ID || userId === ADMIN_TOKEN_USER.id) {
            return true;
        }
        const roles = await this.store.getRolesForUserId(userId);
        return roles.some(
            (role) =>
                role.name.toLowerCase() === ADMIN.toLowerCase() &&
                role.type === RoleType.ROOT,
        );
    }
}
