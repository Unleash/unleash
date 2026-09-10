import type { Db } from '../../types/index.js';
import type { IProjectReadModel } from './project-read-model-type.js';
import type { IUnleashConfig } from '../../types/index.js';
import { ProjectReadModel } from './project-read-model.js';
import { FakeProjectReadModel } from './fake-project-read-model.js';

export const createProjectReadModel = (
    db: Db,
    config: Pick<IUnleashConfig, 'eventBus' | 'isOss'>,
): IProjectReadModel => {
    return new ProjectReadModel(db, config);
};

export const createFakeProjectReadModel = (): IProjectReadModel => {
    return new FakeProjectReadModel();
};
