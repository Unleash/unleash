import type { Db } from '../../types/index.js';
import type { IOnboardingReadModel } from '../../types/index.js';
import { OnboardingReadModel } from './onboarding-read-model.js';
import { FakeOnboardingReadModel } from './fake-onboarding-read-model.js';

export const createOnboardingReadModel = (db: Db): IOnboardingReadModel => {
    return new OnboardingReadModel(db);
};

export const createFakeOnboardingReadModel = (): IOnboardingReadModel => {
    return new FakeOnboardingReadModel();
};
