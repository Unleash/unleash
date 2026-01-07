import type { Db } from '../../db/db.js';
import type {
    InstanceEvent,
    IOnboardingStore,
    ProjectEvent,
} from './onboarding-store-type.js';

export type DBProjectEvent = {
    event: 'first-flag' | 'first-pre-live' | 'first-live';
    time_to_event: number;
    project: string;
};

export type DBInstanceEvent =
    | {
          event: 'first-flag' | 'first-pre-live' | 'first-live';
          time_to_event: number;
          project?: string;
      }
    | {
          event: 'first-user-login' | 'second-user-login';
          time_to_event: number;
      };

const projectEventLookup: Record<
    ProjectEvent['type'],
    DBProjectEvent['event']
> = {
    'flag-created': 'first-flag',
    'pre-live': 'first-pre-live',
    live: 'first-live',
};

const instanceEventLookup: Record<
    InstanceEvent['type'],
    DBInstanceEvent['event']
> = {
    'flag-created': 'first-flag',
    'pre-live': 'first-pre-live',
    live: 'first-live',
    'first-user-login': 'first-user-login',
    'second-user-login': 'second-user-login',
};

export class OnboardingStore implements IOnboardingStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insertInstanceEvent(event: InstanceEvent): Promise<void> {
        await this.db('onboarding_events_instance')
            .insert({
                event: instanceEventLookup[event.type],
                time_to_event: event.timeToEvent,
            })
            .onConflict()
            .ignore();
    }

    async insertProjectEvent(event: ProjectEvent): Promise<void> {
        await this.db<DBProjectEvent>('onboarding_events_project')
            .insert({
                event: projectEventLookup[event.type],
                time_to_event: event.timeToEvent,
                project: event.project,
            })
            .onConflict()
            .ignore();
    }

    async deleteAll(): Promise<void> {
        await Promise.all([
            this.db('onboarding_events_project').del(),
            this.db('onboarding_events_instance').del(),
        ]);
    }
}
