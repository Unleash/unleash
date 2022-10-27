import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { Logger, LogProvider } from '../logger';
import EventEmitter from 'events';
import { Knex } from 'knex';
import { PartialSome } from '../types/partial';
import {
    ISuggestChange,
    ISuggestChangeset,
    SuggestChangeAction,
    SuggestChangesetState,
} from '../types/model';

const T = {
    SUGGEST_CHANGE: 'suggest_change',
    SUGGEST_CHANGE_SET: 'suggest_change_set',
};

interface ISuggestChangesetRow {
    id: number;
    state: SuggestChangesetState;
    environment: string;
    project: string;
    created_at: Date;
    created_by: number;
    changeSetUsername: string;
    changeSetAvatar: string;
    changeId: number;
    changeFeature: string;
    changeAction: SuggestChangeAction;
    changePayload: any;
    changeCreatedAt: Date;
    changeCreatedBy: number;
    changeCreatedByUsername: string;
    changeCreatedByAvatar: string;
}

const suggestChangeRowReducer = (
    acc: Record<number, ISuggestChangeset>,
    suggestChangeRow: ISuggestChangesetRow,
): Record<number, ISuggestChangeset> => {
    const {
        changeId,
        changeAction,
        changePayload,
        changeFeature,
        changeCreatedByUsername,
        changeCreatedByAvatar,
        changeCreatedAt,
        changeCreatedBy,
        ...suggestChangeSet
    } = suggestChangeRow;
    if (!acc[suggestChangeRow.id]) {
        acc[suggestChangeRow.id] = {
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
            features: [],
        };
    }
    const currentSuggestChangeSet = acc[suggestChangeSet.id];

    if (changeId) {
        const featureObject = currentSuggestChangeSet.features.find(
            (feature) => feature.name === changeFeature,
        );
        const change = {
            id: changeId,
            action: changeAction,
            payload: changePayload,
            createdAt: changeCreatedAt,
            createdBy: {
                id: changeCreatedBy,
                username: changeCreatedByUsername,
                imageUrl: changeCreatedByAvatar,
            },
        };
        if (featureObject) {
            featureObject.changes.push(change);
        } else {
            currentSuggestChangeSet.features.push({
                name: changeFeature,
                changes: [change],
            });
        }
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

    private buildSuggestChangeSetChangesQuery = () => {
        return this.db<ISuggestChangesetRow>(
            `${T.SUGGEST_CHANGE_SET} as changeSet`,
        )
            .leftJoin(
                `users as changeSetUser`,
                'changeSet.created_by',
                'changeSetUser.id',
            )
            .leftJoin(`projects`, 'projects.id', 'changeSet.project')
            .leftJoin(
                `${T.SUGGEST_CHANGE} as change`,
                'changeSet.id',
                'change.suggest_change_set_id',
            )
            .leftJoin(
                `users as changeUser`,
                'change.created_by',
                'changeUser.id',
            )
            .select(
                'changeSet.state',
                'changeSet.id',
                'changeSet.environment',
                'projects.name as project',
                'changeSet.created_at',
                'changeSet.created_by',
                'changeSetUser.username as changeSetUsername',
                'changeSetUser.image_url as changeSetAvatar',
                'change.id as changeId',
                'change.feature as changeFeature',
                'change.action as changeAction',
                'change.payload as changePayload',
                'change.created_at as changeCreatedAt',
                'change.created_by as changeCreatedBy',
                'changeUser.username as changeCreatedByUsername',
                'changeUser.image_url as changeCreatedByAvatar',
            );
    };

    getAll = async (): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesQuery();
        return this.mapRows(rows);
    };

    getForProject = async (project: string): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesQuery()
            .where({
                project,
            })
            .whereNot('state', SuggestChangesetState.DRAFT);
        return this.mapRows(rows);
    };

    getDraftsForUser = async (
        userId: number,
        project: string,
    ): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesQuery().where({
            'changeSet.created_by': userId,
            state: SuggestChangesetState.DRAFT,
            project: project,
        });
        const changesets = this.mapRows(rows);
        return changesets;
    };

    getForEnvironment = async (
        environment: string,
    ): Promise<ISuggestChangeset[]> => {
        const rows = await this.buildSuggestChangeSetChangesQuery().where({
            environment,
        });

        return this.mapRows(rows);
    };

    get = async (id: number): Promise<ISuggestChangeset> => {
        const rows = await this.buildSuggestChangeSetChangesQuery().where({
            'changeSet.id': id,
        });

        return this.mapRows(rows)[0];
    };

    create = async (
        suggestChangeSet: PartialSome<
            ISuggestChangeset,
            'id' | 'createdBy' | 'createdAt'
        >,
        userId: number,
    ): Promise<ISuggestChangeset> => {
        const [{ id }] = await this.db(T.SUGGEST_CHANGE_SET)
            .insert({
                environment: suggestChangeSet.environment,
                state: suggestChangeSet.state,
                project: suggestChangeSet.project,
                created_by: userId,
            })
            .returning('id');

        suggestChangeSet.features.forEach((feature) => {
            feature.changes.forEach((change) => {
                this.addChangeToSet(change, feature.name, id, userId);
            });
        });

        return this.get(id);
    };

    addChangeToSet = async (
        change: ISuggestChange,
        feature: string,
        changeSetID: number,
        userId: number,
    ): Promise<void> => {
        await this.db(T.SUGGEST_CHANGE)
            .insert({
                action: change.action,
                feature: feature,
                payload: change.payload,
                suggest_change_set_id: changeSetID,
                created_by: userId,
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

    mapRows = (rows?: ISuggestChangesetRow[]): ISuggestChangeset[] => {
        const suggestChangeSets = rows.reduce<
            Record<number, ISuggestChangeset>
        >(suggestChangeRowReducer, {});
        return Object.values(suggestChangeSets);
    };

    destroy(): void {}

    async updateState(
        id: number,
        state: SuggestChangesetState,
    ): Promise<ISuggestChangeset> {
        await this.db(T.SUGGEST_CHANGE_SET)
            .update('state', state)
            .where({ id });
        return this.get(id);
    }
}
