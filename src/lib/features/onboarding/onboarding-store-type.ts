export type SharedEvent =
    | { type: 'flag-created'; flag: string }
    | { type: 'pre-live'; flag: string }
    | { type: 'live'; flag: string };
export type InstanceEvent =
    | { type: 'first-user-login' }
    | { type: 'second-user-login' };
export type OnboardingEvent = SharedEvent | InstanceEvent;

export interface IOnboardingStore {
    insert(event: OnboardingEvent): Promise<void>;
}
