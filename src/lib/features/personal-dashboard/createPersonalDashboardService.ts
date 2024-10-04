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
import { AccountStore } from '../../db/account-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import { OnboardingReadModel } from '../onboarding/onboarding-read-model';
import { FakeOnboardingReadModel } from '../onboarding/fake-onboarding-read-model';
import { AccessStore } from '../../db/access-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';
import ProjectStore from '../project/project-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';

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
        new ProjectStore(
            db,
            config.eventBus,
            config.getLogger,
            config.flagResolver,
        ),
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
        new FakeProjectStore(),
    );
};
