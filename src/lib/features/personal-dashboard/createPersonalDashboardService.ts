import type { Db } from '../../db/db.js';
import type { IUnleashConfig, IUnleashStores } from '../../types/index.js';
import { PersonalDashboardService } from './personal-dashboard-service.js';
import { PersonalDashboardReadModel } from './personal-dashboard-read-model.js';
import { FakePersonalDashboardReadModel } from './fake-personal-dashboard-read-model.js';
import { ProjectOwnersReadModel } from '../project/project-owners-read-model.js';
import { FakeProjectOwnersReadModel } from '../project/fake-project-owners-read-model.js';
import { ProjectReadModel } from '../project/project-read-model.js';
import { FakeProjectReadModel } from '../project/fake-project-read-model.js';
import { EventStore } from '../../db/event-store.js';
import { FeatureEventFormatterMd } from '../../addons/feature-event-formatter-md.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import { FakePrivateProjectChecker } from '../private-project/fakePrivateProjectChecker.js';
import { PrivateProjectChecker } from '../private-project/privateProjectChecker.js';
import { AccountStore } from '../../db/account-store.js';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store.js';
import { OnboardingReadModel } from '../onboarding/onboarding-read-model.js';
import { FakeOnboardingReadModel } from '../onboarding/fake-onboarding-read-model.js';
import { AccessStore } from '../../db/access-store.js';
import FakeAccessStore from '../../../test/fixtures/fake-access-store.js';

export const createPersonalDashboardService = (
    db: Db,
    config: IUnleashConfig,
    stores: IUnleashStores,
) => {
    return new PersonalDashboardService(
        new PersonalDashboardReadModel(db),
        new ProjectOwnersReadModel(db),
        new ProjectReadModel(db, config.eventBus, config.flagResolver),
        new OnboardingReadModel(db),
        new EventStore(db, config.getLogger),
        new FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        }),
        new PrivateProjectChecker(stores, config),
        new AccountStore(db, config.getLogger),
        new AccessStore(db, config.eventBus, config.getLogger),
    );
};

export const createFakePersonalDashboardService = (config: IUnleashConfig) => {
    return new PersonalDashboardService(
        new FakePersonalDashboardReadModel(),
        new FakeProjectOwnersReadModel(),
        new FakeProjectReadModel(),
        new FakeOnboardingReadModel(),
        new FakeEventStore(),
        new FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        }),
        new FakePrivateProjectChecker(),
        new FakeAccountStore(),
        new FakeAccessStore(),
    );
};
