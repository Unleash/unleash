import type { Db, IUnleashConfig } from '../../server-impl';
import type { IAccessReadModel } from './access-read-model-type';
import { AccessReadModel } from './access-read-model';
import { AccessStore } from '../../db/access-store';
import FakeRoleStore from '../../../test/fixtures/fake-role-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';
import type { IAccessStore } from '../../types';

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
