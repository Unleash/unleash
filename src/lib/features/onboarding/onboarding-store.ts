import type { Db } from '../../db/db';
import type {
    IOnboardingStore,
    OnboardingEvent,
    SharedEvent,
} from './onboarding-store-type';
import { millisecondsToSeconds } from 'date-fns';

type DBInstanceType = {
    event:
        | 'firstUserLogin'
        | 'secondUserLogin'
        | 'firstFlag'
        | 'firstPreLive'
        | 'firstLive';
    time_to_event: number;
};

type DBProjectType = {
    event: 'firstFlag' | 'firstPreLive' | 'firstLive';
    time_to_event: number;
    project: string;
};

const translateEvent = (
    event: OnboardingEvent['type'],
): DBInstanceType['event'] => {
    if (event === 'flagCreated') {
        return 'firstFlag';
    }
    if (event === 'preLive') {
        return 'firstPreLive';
    }
    if (event === 'live') {
        return 'firstLive';
    }
    return event as DBInstanceType['event'];
};

const calculateTimeDifferenceInSeconds = (date1?: Date, date2?: Date) => {
    if (date1 && date2) {
        const diffInMilliseconds = date2.getTime() - date1.getTime();
        return millisecondsToSeconds(diffInMilliseconds);
    }
    return null;
};

export class OnboardingStore implements IOnboardingStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(event: OnboardingEvent): Promise<void> {
        await this.insertInstanceEvent(event);
        if (
            event.type !== 'firstUserLogin' &&
            event.type !== 'secondUserLogin'
        ) {
            await this.insertProjectEvent(event);
        }
    }

    private async insertInstanceEvent(event: OnboardingEvent): Promise<void> {
        const dbEvent = translateEvent(event.type);
        const exists = await this.db<DBInstanceType>(
            'onboarding_events_instance',
        )
            .where({ event: dbEvent })
            .first();

        if (exists) return;

        const firstInstanceUser = await this.db('users')
            .select('created_at')
            .orderBy('created_at', 'asc')
            .first();

        if (!firstInstanceUser) return;

        const timeToEvent = calculateTimeDifferenceInSeconds(
            firstInstanceUser.created_at,
            new Date(),
        );
        if (timeToEvent === null) return;

        await this.db('onboarding_events_instance').insert({
            event: dbEvent,
            time_to_event: timeToEvent,
        });
    }

    private async insertProjectEvent(event: SharedEvent): Promise<void> {
        const dbEvent = translateEvent(event.type) as DBProjectType['event'];

        const projectRow = await this.db<{ project: string; name: string }>(
            'features',
        )
            .select('project')
            .where({ name: event.flag })
            .first();

        if (!projectRow) return;

        const project = projectRow.project;

        const exists = await this.db('onboarding_events_project')
            .where({ event: dbEvent, project })
            .first();

        if (exists) return;

        const projectCreatedAt = await this.db<{
            created_at: Date;
            id: string;
        }>('projects')
            .select('created_at')
            .where({ id: project })
            .first();

        if (!projectCreatedAt) return;

        const timeToEvent = calculateTimeDifferenceInSeconds(
            projectCreatedAt.created_at,
            new Date(),
        );
        if (timeToEvent === null) return;

        await this.db<DBProjectType>('onboarding_events_project').insert({
            event: dbEvent,
            time_to_event: timeToEvent,
            project: project,
        });
    }
}
