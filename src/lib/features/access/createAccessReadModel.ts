import type { Db, IUnleashConfig } from '../../types/index.js';
import type { IAccessReadModel } from './access-read-model-type.js';
import { AccessReadModel } from './access-read-model.js';
import { AccessStore } from '../../db/access-store.js';
import FakeRoleStore from '../../../test/fixtures/fake-role-store.js';
import FakeAccessStore from '../../../test/fixtures/fake-access-store.js';
import type { IAccessStore } from '../../types/index.js';

export const createAccessReadModel = (
    db: Db,
    config: IUnleashConfig,
): IAccessReadModel => {
    const { eventBus, getLogger } = config;
    const accessStore = new AccessStore(db, eventBus, getLogger);
    return new AccessReadModel({ accessStore });
};

export const createFakeAccessReadModel = (
    accessStore?: IAccessStore,
): IAccessReadModel => {
    const roleStore = new FakeRoleStore();
    const finalAccessStore = accessStore ?? new FakeAccessStore(roleStore);
    return new AccessReadModel({ accessStore: finalAccessStore });
};
