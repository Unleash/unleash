import { Db, IUnleashConfig } from 'lib/server-impl';
import { ChangeRequestAccessReadModel } from './sql-change-request-access-read-model';
import { createAccessService } from '../access/createAccessService';
import { FakeChangeRequestAccessReadModel } from './fake-change-request-access-read-model';
import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

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
