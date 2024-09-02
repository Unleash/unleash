import type {
    InstanceEvent,
    IOnboardingStore,
    ProjectEvent,
} from './onboarding-store-type';

export class FakeOnboardingStore implements IOnboardingStore {
    insertProjectEvent(event: ProjectEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
    insertInstanceEvent(event: InstanceEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
