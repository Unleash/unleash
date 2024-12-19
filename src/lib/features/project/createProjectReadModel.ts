import type EventEmitter from 'events';
import type { Db } from '../../server-impl';
import type { IProjectReadModel } from './project-read-model-type';
import type { IFlagResolver } from '../../types';
import { ProjectReadModel } from './project-read-model';
import { FakeProjectReadModel } from './fake-project-read-model';

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
