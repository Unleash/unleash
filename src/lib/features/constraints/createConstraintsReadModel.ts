import type { IContextFieldStore } from '../../types/index.js';
import { ConstraintsReadModel } from './constraints-read-model.js';
import { FakeConstraintsReadModel } from './fake-constraints-read-model.js';
import type { IConstraintsReadModel } from './constraints-read-model-type.js';

export const createConstraintsReadModel = (
    contextFieldStore: IContextFieldStore,
): IConstraintsReadModel => {
    return new ConstraintsReadModel(contextFieldStore);
};

export const createFakeConstraintsReadModel = (): IConstraintsReadModel => {
    return new FakeConstraintsReadModel();
};
