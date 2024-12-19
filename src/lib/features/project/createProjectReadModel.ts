import type { Db, IUnleashConfig } from '../../server-impl';
import type { IProjectReadModel } from './project-read-model-type';
import { ProjectReadModel } from './project-read-model';
import { FakeProjectReadModel } from './fake-project-read-model';

export const createProjectReadModel = (
    db: Db,
    config: Pick<IUnleashConfig, 'eventBus' | 'flagResolver' | 'isOss'>,
): IProjectReadModel => {
    return new ProjectReadModel(db, config);
};

export const createFakeProjectReadModel = (): IProjectReadModel => {
    return new FakeProjectReadModel();
};
