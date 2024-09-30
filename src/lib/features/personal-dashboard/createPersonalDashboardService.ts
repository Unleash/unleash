import type { Db } from '../../db/db';
import type { IUnleashConfig, IUnleashStores } from '../../types';
import { PersonalDashboardService } from './personal-dashboard-service';
import { PersonalDashboardReadModel } from './personal-dashboard-read-model';
import { FakePersonalDashboardReadModel } from './fake-personal-dashboard-read-model';
import { ProjectOwnersReadModel } from '../project/project-owners-read-model';
import { FakeProjectOwnersReadModel } from '../project/fake-project-owners-read-model';
import { ProjectReadModel } from '../project/project-read-model';
import { FakeProjectReadModel } from '../project/fake-project-read-model';
import EventStore from '../../db/event-store';
import { FeatureEventFormatterMd } from '../../addons/feature-event-formatter-md';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import { FakePrivateProjectChecker } from '../private-project/fakePrivateProjectChecker';
import { PrivateProjectChecker } from '../private-project/privateProjectChecker';

export const createPersonalDashboardService = (
    db: Db,
    config: IUnleashConfig,
    stores: IUnleashStores,
) => {
    return new PersonalDashboardService(
        new PersonalDashboardReadModel(db),
        new ProjectOwnersReadModel(db),
        new ProjectReadModel(db, config.eventBus, config.flagResolver),
        new EventStore(db, config.getLogger),
        new FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        }),
        new PrivateProjectChecker(stores, config),
    );
};

export const createFakePersonalDashboardService = (config: IUnleashConfig) => {
    return new PersonalDashboardService(
        new FakePersonalDashboardReadModel(),
        new FakeProjectOwnersReadModel(),
        new FakeProjectReadModel(),
        new FakeEventStore(),
        new FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        }),
        new FakePrivateProjectChecker(),
    );
};
