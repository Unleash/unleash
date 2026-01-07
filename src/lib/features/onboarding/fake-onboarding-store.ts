import type {
    InstanceEvent,
    IOnboardingStore,
    ProjectEvent,
} from './onboarding-store-type.js';

export class FakeOnboardingStore implements IOnboardingStore {
    insertProjectEvent(_event: ProjectEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async insertInstanceEvent(_event: InstanceEvent): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
