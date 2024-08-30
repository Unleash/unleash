import type {
    IOnboardingStore,
    OnboardingEvent,
} from './onboarding-store-type';

export class FakeOnboardingStore implements IOnboardingStore {
    async insert(event: OnboardingEvent): Promise<void> {
        return;
    }
}
