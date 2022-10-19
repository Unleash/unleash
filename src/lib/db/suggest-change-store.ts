import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { Logger, LogProvider } from '../logger';
import EventEmitter from 'events';
import { Knex } from 'knex';
import { PartialSome } from '../types/partial';
import {
    ISuggestChange,
    ISuggestChangeEvent,
    ISuggestChangeSet,
    SuggestChangeAction,
    SuggestChangeEvent,
    SuggestChangeSetEvent,
} from '../types/model';
import User from '../types/user';

const Tables = {
    suggestChange: 'suggest_change',
    suggestChangeSet: 'suggest_change_set',
    suggestChangeEvent: 'suggest_change_event',
};

interface ISuggestChangeEventRow {
    id: number;
    event: SuggestChangeSetEvent;
    data?: unknown;
    created_by?: string;
    created_at?: Date;
}
interface ISuggestChangeSetInsert {
    id: number;
    environment: string;
    state?: string;
    project?: string;
    created_by?: string;
    created_at?: Date;
}

interface ISuggestChangeInsert {
    id: number;
    action: SuggestChangeAction;
    feature: string;
    payload?: string;
    created_by?: string;
    created_at?: Date;
}

interface ISuggestChangeSetRow extends ISuggestChangeSetInsert {
    changes?: ISuggestChange[];
    events?: ISuggestChangeEvent[];
}

const suggestChangeRowReducer = (acc, suggestChangeRow) => {
    const {
        eventId,
        eventType,
        eventData,
        eventCreatedAt,
        eventCreatedBy,
        changeId,
        changeAction,
        changePayload,
        changeCreatedBy,
        changeCreatedAt,
        ...suggestChangeSet
    } = suggestChangeRow;
    if (!acc[suggestChangeRow.secret]) {
        acc[suggestChangeRow.secret] = {
            id: suggestChangeSet.id,
            environment: suggestChangeSet.environment,
            state: suggestChangeSet.state,
            project: suggestChangeSet.project,
            createdBy: suggestChangeSet.created_by,
            createdAt: suggestChangeSet.created_at,
            changes: [],
            events: [],
        };
    }
    const currentSuggestChangeSet = acc[suggestChangeSet.id];
    if (eventId) {
        currentSuggestChangeSet.events.push({
            id: eventId,
            event: eventType,
            data: JSON.parse(eventData),
            createdBy: eventCreatedAt,
            createdAt: eventCreatedBy,
        });
    }

    if (changeId) {
        currentSuggestChangeSet.changes.push({
            id: changeId,
            action: changeAction,
            payload: JSON.parse(changePayload),
            createdAt: changeCreatedAt,
            createdBy: changeCreatedBy,
        });
    }
    return acc;
};

export class SuggestChangeStore implements ISuggestChangeStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/suggest-change-store.ts');
    }

    private makeSuggestChangeSetChangesEventsQuery = () => {
        return this.db<ISuggestChangeSetRow>(
            `${Tables.suggestChangeSet} as changeSet`,
        )
            .leftJoin(
                `${Tables.suggestChange} as change`,
                'changeSet.id',
                'change.suggest_change_set_id',
            )
            .leftJoin(
                `${Tables.suggestChangeEvent} as event`,
                'changeSet.id',
                'event.suggest_change_set_id',
            )
            .select(
                'changeSet.secret',
                'changeSet.environment',
                'changeSet.project',
                'changeSet.createAt',
                'changeSet.createBy',
                'change.id as changeId.',
                'change.action as changeAction',
                'change.payload as changePayload',
                'change.created_at as changeCreatedAt',
                'change.created_by as changeCreatedBy',
                'event.id as eventId',
                'event.event as eventType',
                'event.data as eventData',
                'event.created_at as eventCreatedAt',
                'event.created_by as eventCreatedBy',
            );
    };

    getAll = async (): Promise<ISuggestChangeSet[]> => {
        const rows = await this.makeSuggestChangeSetChangesEventsQuery();
        return this.mapRows(rows);
    };

    getForProject = async (project: string): Promise<ISuggestChangeSet[]> => {
        const rows = await this.makeSuggestChangeSetChangesEventsQuery().where({
            project,
        });

        return this.mapRows(rows);
    };

    getForEnvironment = async (
        environment: string,
    ): Promise<ISuggestChangeSet[]> => {
        const rows = await this.makeSuggestChangeSetChangesEventsQuery().where({
            environment,
        });

        return this.mapRows(rows);
    };

    get = async (id: number): Promise<ISuggestChangeSet> => {
        const rows = await this.makeSuggestChangeSetChangesEventsQuery().where({
            id,
        });

        return this.mapRows(rows)[0];
    };

    create = async (
        suggestChangeSet: PartialSome<ISuggestChangeSet, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeSet> => {
        const [{ id }] = await this.db(Tables.suggestChangeSet)
            .insert<ISuggestChangeSetInsert>({
                id: suggestChangeSet.id,
                environment: suggestChangeSet.environment,
                state: suggestChangeSet.state,
                project: suggestChangeSet.project,
                changes: JSON.stringify(suggestChangeSet.changes),
                created_at: suggestChangeSet.createdAt,
                created_by: user.username || user.email,
            })
            .returning('id');

        suggestChangeSet.changes.forEach((change) => {
            this.addChangeToSet(change, id, user);
        });

        return this.get(id);
    };

    addChangeToSet = async (
        change: ISuggestChange,
        changeSetID: number,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void> => {
        await this.db(Tables.suggestChange)
            .insert<ISuggestChangeInsert>({
                action: change.action,
                feature: change.feature,
                payload: JSON.stringify(change.payload),
                suggest_change_set_id: changeSetID,
                created_at: change.createdAt,
                created_by: user.username || user.email,
            })
            .returning('id');

        await this.createEventForChange(
            SuggestChangeEvent[change.action],
            changeSetID,
            { feature: change.feature, data: change.payload },
            user,
        );
    };

    createEventForChange = async (
        event: string,
        changeSetID: number,
        data: unknown,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void> => {
        await this.db(Tables.suggestChangeEvent)
            .insert<ISuggestChangeEventRow>({
                event,
                data,
                suggest_change_set_id: changeSetID,
                created_by: user.username || user.email,
            })
            .returning('id');
    };

    delete = (id: number): Promise<void> => {
        return this.db(Tables.suggestChangeSet).where({ id }).del();
    };

    deleteAll = (): Promise<void> => {
        return this.db(Tables.suggestChangeSet).del();
    };

    exists = async (id: number): Promise<boolean> => {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${Tables.suggestChangeSet} WHERE id = ?) AS present`,
            [id],
        );

        return result.rows[0].present;
    };

    mapRows = (rows?: any[]): ISuggestChangeSet[] => {
        const suggestChangeSets = rows.reduce(suggestChangeRowReducer, {});
        return Object.values(suggestChangeSets);
    };

    destroy(): void {}
}
