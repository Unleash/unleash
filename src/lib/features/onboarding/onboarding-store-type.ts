export type ProjectEvent =
    | { type: 'flag-created'; project: string; timeToEvent: number }
    | { type: 'pre-live'; project: string; timeToEvent: number }
    | { type: 'live'; project: string; timeToEvent: number };
export type InstanceEvent =
    | { type: 'flag-created'; timeToEvent: number }
    | { type: 'pre-live'; timeToEvent: number }
    | { type: 'live'; timeToEvent: number }
    | { type: 'first-user-login'; timeToEvent: number }
    | { type: 'second-user-login'; timeToEvent: number };

export interface IOnboardingStore {
    insertProjectEvent(event: ProjectEvent): Promise<void>;

    insertInstanceEvent(event: InstanceEvent): Promise<void>;

    deleteAll(): Promise<void>;
}
