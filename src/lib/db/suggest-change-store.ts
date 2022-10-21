import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { Logger, LogProvider } from '../logger';
import EventEmitter from 'events';
import { Knex } from 'knex';
import { PartialSome } from '../types/partial';
import {
    ISuggestChange,
    ISuggestChangeEvent,
    ISuggestChangeEventData,
    ISuggestChangeset,
    SuggestChangeAction,
    SuggestChangeEvent,
    SuggestChangesetEvent,
} from '../types/model';
import User from '../types/user';

const T = {
    SUGGEST_CHANGE: 'suggest_change',
    SUGGEST_CHANGE_SET: 'suggest_change_set',
    SUGGEST_CHANGE_EVENT: 'suggest_change_event',
};

interface ISuggestChangeEventRow {
    id: number;
    event: SuggestChangesetEvent;
    data?: ISuggestChangeEventData;
    created_by?: number;
    created_at?: Date;
}

interface ISuggestChangesetInsert {
    id: number;
    environment: string;
    state?: string;
    project?: string;
    created_by?: number;
    created_at?: Date;
}

interface ISuggestChangeInsert {
    id: number;
    action: SuggestChangeAction;
    feature: string;
    payload?: unknown;
    created_by?: number;
    created_at?: Date;
}

interface ISuggestChangesetRow extends ISuggestChangesetInsert {
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
        eventCreatedByUsername,
        eventCreatedByAvatar,
        changeId,
        changeAction,
        changePayload,
        changeCreatedByUsername,
        changeCreatedByAvatar,
        changeCreatedAt,
        changeCreatedBy,
        ...suggestChangeSet
    } = suggestChangeRow;
    if (!acc[suggestChangeRow.secret]) {
        acc[suggestChangeRow.secret] = {
            id: suggestChangeSet.id,
            environment: suggestChangeSet.environment,
            state: suggestChangeSet.state,
            project: suggestChangeSet.project,
            createdBy: {
                id: suggestChangeSet.created_by,
                username: suggestChangeSet.changeSetUsername,
                imageUrl: suggestChangeSet.changeSetAvatar,
            },
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
            data: eventData,
            createdBy: {
                id: eventCreatedBy,
                username: eventCreatedByUsername,
                imageUrl: eventCreatedByUsername,
            },
            createdAt: eventCreatedAt,
        });
    }

    if (changeId) {
        currentSuggestChangeSet.changes.push({
            id: changeId,
            action: changeAction,
            payload: changePayload,
            createdAt: changeCreatedAt,
            createdBy: {
                id: changeCreatedBy,
                username: changeCreatedByUsername,
                imageUrl: changeCreatedByAvatar,
            },
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

    private buildSuggestChangeSetChangesEventsQuery = () => {
        return this.db<ISuggestChangesetRow>(
            `${T.SUGGEST_CHANGE_SET} as changeSet`,
        )
            .leftJoin(
                `users as changSetUser`,
                'changeSet.createdBy',
                'changSetUser.id',
            )
            .leftJoin(
                `${T.SUGGEST_CHANGE} as change`,
                'changeSet.id',
                'change.suggest_change_set_id',
            )
            .leftJoin(`users as changUser`, 'change.createdBy', 'changUser.id')
            .leftJoin(
                `${T.SUGGEST_CHANGE_EVENT} as event`,
                'changeSet.id',
                'event.suggest_change_set_id',
            )
            .leftJoin(`users as eventUser`, 'eventUser.id', 'event.createdBy')
            .select(
                'changeSet.secret',
                'changeSet.environment',
                'changeSet.project',
                'changeSet.created_at',
                'changeSet.created_by',
                'changeSetUser.username as changeSetUsername',
                'changeSetUser.imageUrl as changeSetAvatar',
                'change.id as changeId.',
                'change.action as changeAction',
                'change.payload as changePayload',
                'change.created_at as changeCreatedAt',
                'change.created_by as changeCreatedBy',
                'changUser.username as changeCreatedByUsername',
                'changUser.imageUrl as changeCreatedByAvatar',
                'event.id as eventId',
                'event.event as eventType',
                'event.data as eventData',
                'event.created_at as eventCreatedAt',
                'event.created_by as eventCreatedBy',
                'eventUser.username as eventCreatedByUsername',
                'eventUser.imageUrl as eventCreatedByAvatar',
            );
    };

    getAll = async (): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesEventsQuery();
        return this.mapRows(rows);
    };

    getForProject = async (project: string): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesEventsQuery().where(
            {
                project,
            },
        );

        return this.mapRows(rows);
    };

    getForUser = async (user: User): Promise<ISuggestChangeset> => {
        const rows = await this.buildSuggestChangeSetChangesEventsQuery().where(
            {
                created_by: user.id,
            },
        );

        return this.mapRows(rows)[0];
    };

    getForEnvironment = async (
        environment: string,
    ): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesEventsQuery().where(
            {
                environment,
            },
        );

        return this.mapRows(rows);
    };

    get = async (id: number): Promise<ISuggestChangeset> => {
        const rows = await this.buildSuggestChangeSetChangesEventsQuery().where(
            {
                id,
            },
        );

        return this.mapRows(rows)[0];
    };

    create = async (
        suggestChangeSet: PartialSome<
            ISuggestChangeset,
            'id' | 'createdBy' | 'createdAt'
        >,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeset> => {
        const [{ id }] = await this.db(T.SUGGEST_CHANGE_SET)
            .insert<ISuggestChangesetInsert>({
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
        change: PartialSome<ISuggestChange, 'id' | 'createdBy' | 'createdAt'>,
        changeSetID: number,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void> => {
        await this.db(T.SUGGEST_CHANGE)
            .insert<ISuggestChangeInsert>({
                action: change.action,
                feature: change.feature,
                payload: change.payload,
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
        data: ISuggestChangeEventData,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<void> => {
        await this.db(T.SUGGEST_CHANGE_EVENT)
            .insert<ISuggestChangeEventRow>({
                event,
                data,
                suggest_change_set_id: changeSetID,
                created_by: user.username || user.email,
            })
            .returning('id');
    };

    delete = (id: number): Promise<void> => {
        return this.db(T.SUGGEST_CHANGE_SET).where({ id }).del();
    };

    deleteAll = (): Promise<void> => {
        return this.db(T.SUGGEST_CHANGE_SET).del();
    };

    exists = async (id: number): Promise<boolean> => {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.SUGGEST_CHANGE_SET} WHERE id = ?) AS present`,
            [id],
        );

        return result.rows[0].present;
    };

    mapRows = (rows?: any[]): ISuggestChangeset[] => {
        const suggestChangeSets = rows.reduce(suggestChangeRowReducer, {});
        return Object.values(suggestChangeSets);
    };

    destroy(): void {}
}
