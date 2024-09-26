import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import { PersonalDashboardService } from './personal-dashboard-service';
import { PersonalDashboardReadModel } from './personal-dashboard-read-model';
import { FakePersonalDashboardReadModel } from './fake-personal-dashboard-read-model';
import { ProjectOwnersReadModel } from '../project/project-owners-read-model';
import { FakeProjectOwnersReadModel } from '../project/fake-project-owners-read-model';
import { ProjectReadModel } from '../project/project-read-model';
import { FakeProjectReadModel } from '../project/fake-project-read-model';

export const createPersonalDashboardService = (
    db: Db,
    config: IUnleashConfig,
) => {
    return new PersonalDashboardService(
        new PersonalDashboardReadModel(db),

        new ProjectOwnersReadModel(db),
        new ProjectReadModel(db, config.eventBus, config.flagResolver),
    );
};

export const createFakePersonalDashboardService = () => {
    return new PersonalDashboardService(
        new FakePersonalDashboardReadModel(),
        new FakeProjectOwnersReadModel(),
        new FakeProjectReadModel(),
    );
};
