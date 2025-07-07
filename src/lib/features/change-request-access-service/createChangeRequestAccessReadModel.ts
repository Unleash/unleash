import type { Db, IUnleashConfig } from '../../types/index.js';
import { ChangeRequestAccessReadModel } from './sql-change-request-access-read-model.js';
import { createAccessService } from '../access/createAccessService.js';
import { FakeChangeRequestAccessReadModel } from './fake-change-request-access-read-model.js';
import type { IChangeRequestAccessReadModel } from './change-request-access-read-model.js';

export const createChangeRequestAccessReadModel = (
    db: Db,
    config: IUnleashConfig,
): IChangeRequestAccessReadModel => {
    const accessService = createAccessService(db, config);

    return new ChangeRequestAccessReadModel(db, accessService);
};

export const createFakeChangeRequestAccessService =
    (): IChangeRequestAccessReadModel => {
        return new FakeChangeRequestAccessReadModel();
    };
