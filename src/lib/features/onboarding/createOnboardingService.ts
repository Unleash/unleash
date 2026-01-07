import type { IUnleashConfig } from '../../types/index.js';
import type { Db } from '../../db/db.js';
import { OnboardingService } from './onboarding-service.js';
import { OnboardingStore } from './onboarding-store.js';
import { ProjectReadModel } from '../project/project-read-model.js';
import { UserStore } from '../users/user-store.js';
import FakeUserStore from '../../../test/fixtures/fake-user-store.js';
import { FakeProjectReadModel } from '../project/fake-project-read-model.js';
import { FakeOnboardingStore } from './fake-onboarding-store.js';

export const createOnboardingService =
    (config: IUnleashConfig) =>
    (db: Db): OnboardingService => {
        const { eventBus, flagResolver, getLogger } = config;
        const onboardingStore = new OnboardingStore(db);
        const projectReadModel = new ProjectReadModel(
            db,
            eventBus,
            flagResolver,
        );
        const userStore = new UserStore(db, getLogger);
        const onboardingService = new OnboardingService(
            {
                onboardingStore,
                projectReadModel,
                userStore,
            },
            config,
        );

        return onboardingService;
    };

export const createFakeOnboardingService = (config: IUnleashConfig) => {
    const onboardingStore = new FakeOnboardingStore();
    const projectReadModel = new FakeProjectReadModel();
    const userStore = new FakeUserStore();
    const onboardingService = new OnboardingService(
        {
            onboardingStore,
            projectReadModel,
            userStore,
        },
        config,
    );

    return { onboardingService, projectReadModel, userStore, onboardingStore };
};
