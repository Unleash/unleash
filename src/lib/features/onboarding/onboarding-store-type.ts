export type SharedEvent =
    | { type: 'flagCreated'; flag: string }
    | { type: 'preLive'; flag: string }
    | { type: 'live'; flag: string };
export type InstanceEvent =
    | { type: 'firstUserLogin' }
    | { type: 'secondUserLogin' };
export type OnboardingEvent = SharedEvent | InstanceEvent;

export interface IOnboardingStore {
    insert(event: OnboardingEvent): Promise<void>;
}
