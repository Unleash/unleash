import type { Db } from '../../db/db.js';
import type { IContextFieldStore } from '../../internals.js';
import { ConstraintsReadModel } from './constraints-read-model.js';
import { FakeConstraintsReadModel } from './fake-constraints-read-model.js';
import type { IConstraintsReadModel } from './constraints-read-model-type.js';

export const createConstraintsReadModel = (
    db: Db,
    contextFieldStore: IContextFieldStore,
): IConstraintsReadModel => {
    return new ConstraintsReadModel(db, contextFieldStore);
};

export const createFakeConstraintsReadModel = (): IConstraintsReadModel => {
    return new FakeConstraintsReadModel();
};
