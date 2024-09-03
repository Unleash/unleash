import type { Db } from '../../server-impl';
import type { IOnboardingReadModel } from '../../types';
import { OnboardingReadModel } from './onboarding-read-model';
import { FakeOnboardingReadModel } from './fake-onboarding-read-model';

export const createOnboardingReadModel = (db: Db): IOnboardingReadModel => {
    return new OnboardingReadModel(db);
};

export const createFakeOnboardingReadModel = (): IOnboardingReadModel => {
    return new FakeOnboardingReadModel();
};
