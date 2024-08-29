import type { IOnboardingReadModel } from '../../types';
import type { InstanceOnboarding } from './onboarding-read-model-type';

export class FakeOnboardingReadModel implements IOnboardingReadModel {
    getInstanceOnboardingMetrics(): Promise<InstanceOnboarding> {
        return Promise.resolve({
            firstLogin: null,
            secondLogin: null,
            firstFeatureFlag: null,
            firstPreLive: null,
            firstLive: null,
        });
    }
}
