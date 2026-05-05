import type {
    Db,
    IFlagResolver,
    IOnboardingReadModel,
} from '../../types/index.js';
import { OnboardingReadModel } from './onboarding-read-model.js';
import { FakeOnboardingReadModel } from './fake-onboarding-read-model.js';

export const createOnboardingReadModel = (
    db: Db,
    flagResolver: IFlagResolver,
): IOnboardingReadModel => {
    return new OnboardingReadModel(db, flagResolver);
};

export const createFakeOnboardingReadModel = (): IOnboardingReadModel => {
    return new FakeOnboardingReadModel();
};
