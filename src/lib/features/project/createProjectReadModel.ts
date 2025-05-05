import type EventEmitter from 'events';
import type { Db } from '../../types/index.js';
import type { IProjectReadModel } from './project-read-model-type.js';
import type { IFlagResolver } from '../../types/index.js';
import { ProjectReadModel } from './project-read-model.js';
import { FakeProjectReadModel } from './fake-project-read-model.js';

export const createProjectReadModel = (
    db: Db,
    eventBus: EventEmitter,
    flagResolver: IFlagResolver,
): IProjectReadModel => {
    return new ProjectReadModel(db, eventBus, flagResolver);
};

export const createFakeProjectReadModel = (): IProjectReadModel => {
    return new FakeProjectReadModel();
};
