import type { Db, IUnleashConfig } from '../../types/index.js';
import PrivateProjectStore from './privateProjectStore.js';
import { PrivateProjectChecker } from './privateProjectChecker.js';
import { FakePrivateProjectChecker } from './fakePrivateProjectChecker.js';

export const createPrivateProjectChecker = (
    db: Db,
    config: IUnleashConfig,
): PrivateProjectChecker => {
    const { getLogger } = config;
    const privateProjectStore = new PrivateProjectStore(db, getLogger);

    return new PrivateProjectChecker(
        {
            privateProjectStore: privateProjectStore,
        },
        config,
    );
};

export const createFakePrivateProjectChecker =
    (): FakePrivateProjectChecker => {
        return new FakePrivateProjectChecker();
    };
