import {
    FEATURE_IMPORT,
    FEATURES_IMPORTED,
    type IBaseEvent,
    type IEvent,
    type IEventType,
    SEGMENT_UPDATED,
} from '../../types/events';
import type { Logger, LogProvider } from '../../logger';
import type {
    IEventSearchParams,
    IEventStore,
} from '../../types/stores/event-store';
import type { ITag } from '../../types/model';
import { sharedEventEmitter } from '../../util/anyEventEmitter';
import type { Db } from '../../db/db';
import type { Knex } from 'knex';
import type EventEmitter from 'events';
import { ADMIN_TOKEN_USER, SYSTEM_USER, SYSTEM_USER_ID } from '../../types';
import type { DeprecatedSearchEventsSchema } from '../../openapi';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { applyGenericQueryParams } from '../feature-search/search-utils';

const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
    'created_by_user_id',
    'data',
    'pre_data',
    'tags',
    'feature_name',
    'project',
    'environment',
] as const;

export type IQueryOperations =
    | IWhereOperation
    | IBeforeDateOperation
    | IBetweenDatesOperation
    | IForFeaturesOperation;

interface IWhereOperation {
    op: 'where';
    parameters: {
        [key: string]: string;
    };
}

interface IBeforeDateOperation {
    op: 'beforeDate';
    parameters: {
        dateAccessor: string;
        date: string;
    };
}

interface IBetweenDatesOperation {
    op: 'betweenDate';
    parameters: {
        dateAccessor: string;
        range: string[];
    };
}

interface IForFeaturesOperation {
    op: 'forFeatures';
    parameters: IForFeaturesParams;
}

interface IForFeaturesParams {
    type: string;
    projectId: string;
    environments: string[];
    features: string[];
}

export interface IEventTable {
    id: number;
    type: string;
    created_by: string;
    created_at: Date;
    created_by_user_id: number;
    data?: any;
    pre_data?: any;
    feature_name?: string;
    project?: string;
    environment?: string;
    tags: ITag[];
}

const TABLE = 'events';

class EventStore implements IEventStore {
    private db: Db;

    // only one shared event emitter should exist across all event store instances
    private eventEmitter: EventEmitter = sharedEventEmitter;

    private logger: Logger;

    // a new DB has to be injected per transaction
    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('event-store');
    }

    async store(event: IBaseEvent): Promise<void> {
        try {
            await this.db(TABLE)
                .insert(this.eventToDbRow(event))
                .returning(EVENT_COLUMNS);
        } catch (error: unknown) {
            this.logger.warn(`Failed to store "${event.type}" event: ${error}`);
        }
    }

    async count(): Promise<number> {
        const count = await this.db(TABLE)
            .count<Record<string, number>>()
            .first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        } else {
            return count.count;
        }
    }

    async deprecatedFilteredCount(
        eventSearch: DeprecatedSearchEventsSchema,
    ): Promise<number> {
        let query = this.db(TABLE);
        if (eventSearch.type) {
            query = query.andWhere({ type: eventSearch.type });
        }
        if (eventSearch.project) {
            query = query.andWhere({ project: eventSearch.project });
        }
        if (eventSearch.feature) {
            query = query.andWhere({ feature_name: eventSearch.feature });
        }
        const count = await query.count().first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        } else {
            return count.count;
        }
    }

    async searchEventsCount(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
    ): Promise<number> {
        const query = this.buildSearchQuery(params, queryParams);
        const count = await query.count().first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return Number.parseInt(count.count, 10);
        } else {
            return count.count;
        }
    }

    async batchStore(events: IBaseEvent[]): Promise<void> {
        try {
            await this.db(TABLE).insert(events.map(this.eventToDbRow));
        } catch (error: unknown) {
            this.logger.warn(
                `Failed to store events: ${JSON.stringify(events)}`,
                error,
            );
        }
    }

    async getMaxRevisionId(largerThan: number = 0): Promise<number> {
        const row = await this.db(TABLE)
            .max('id')
            .where((builder) =>
                builder
                    .whereNotNull('feature_name')
                    .orWhereIn('type', [
                        SEGMENT_UPDATED,
                        FEATURE_IMPORT,
                        FEATURES_IMPORTED,
                    ]),
            )
            .andWhere('id', '>=', largerThan)
            .first();
        return row?.max ?? 0;
    }

    async delete(key: number): Promise<void> {
        await this.db(TABLE).where({ id: key }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async query(operations: IQueryOperations[]): Promise<IEvent[]> {
        try {
            let query: Knex.QueryBuilder = this.select();

            operations.forEach((operation) => {
                if (operation.op === 'where') {
                    query = this.where(query, operation.parameters);
                }

                if (operation.op === 'forFeatures') {
                    query = this.forFeatures(query, operation.parameters);
                }

                if (operation.op === 'beforeDate') {
                    query = this.beforeDate(query, operation.parameters);
                }

                if (operation.op === 'betweenDate') {
                    query = this.betweenDate(query, operation.parameters);
                }
            });

            const rows = await query;
            return rows.map(this.rowToEvent);
        } catch (e) {
            return [];
        }
    }

    async queryCount(operations: IQueryOperations[]): Promise<number> {
        try {
            let query: Knex.QueryBuilder = this.db.count().from(TABLE);

            operations.forEach((operation) => {
                if (operation.op === 'where') {
                    query = this.where(query, operation.parameters);
                }

                if (operation.op === 'forFeatures') {
                    query = this.forFeatures(query, operation.parameters);
                }

                if (operation.op === 'beforeDate') {
                    query = this.beforeDate(query, operation.parameters);
                }

                if (operation.op === 'betweenDate') {
                    query = this.betweenDate(query, operation.parameters);
                }
            });

            const queryResult = await query.first();
            return Number.parseInt(queryResult.count || 0);
        } catch (e) {
            return 0;
        }
    }

    where(
        query: Knex.QueryBuilder,
        parameters: { [key: string]: string },
    ): Knex.QueryBuilder {
        return query.where(parameters);
    }

    beforeDate(
        query: Knex.QueryBuilder,
        parameters: { dateAccessor: string; date: string },
    ): Knex.QueryBuilder {
        return query.andWhere(parameters.dateAccessor, '>=', parameters.date);
    }

    betweenDate(
        query: Knex.QueryBuilder,
        parameters: { dateAccessor: string; range: string[] },
    ): Knex.QueryBuilder {
        if (parameters.range && parameters.range.length === 2) {
            return query.andWhereBetween(parameters.dateAccessor, [
                parameters.range[0],
                parameters.range[1],
            ]);
        }

        return query;
    }

    select(): Knex.QueryBuilder {
        return this.db.select(EVENT_COLUMNS).from(TABLE);
    }

    forFeatures(
        query: Knex.QueryBuilder,
        parameters: IForFeaturesParams,
    ): Knex.QueryBuilder {
        return query
            .where({ type: parameters.type, project: parameters.projectId })
            .whereIn('feature_name', parameters.features)
            .whereIn('environment', parameters.environments);
    }

    async get(key: number): Promise<IEvent> {
        const row = await this.db(TABLE).where({ id: key }).first();
        return this.rowToEvent(row);
    }

    async getAll(query?: Object): Promise<IEvent[]> {
        return this.getEvents(query);
    }

    async getEvents(query?: Object): Promise<IEvent[]> {
        try {
            let qB = this.db
                .select(EVENT_COLUMNS)
                .from(TABLE)
                .limit(100)
                .orderBy('created_at', 'desc');
            if (query) {
                qB = qB.where(query);
            }
            const rows = await qB;
            return rows.map(this.rowToEvent);
        } catch (err) {
            return [];
        }
    }

    async searchEvents(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
    ): Promise<IEvent[]> {
        const query = this.buildSearchQuery(params, queryParams)
            .select(EVENT_COLUMNS)
            .orderBy('created_at', 'desc')
            .limit(Number(params.limit) ?? 100)
            .offset(Number(params.offset) ?? 0);

        try {
            return (await query).map(this.rowToEvent);
        } catch (err) {
            return [];
        }
    }

    private buildSearchQuery(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
    ) {
        let query = this.db.from<IEventTable>(TABLE);

        applyGenericQueryParams(query, queryParams);

        if (params.query) {
            query = query.where((where) =>
                where
                    .orWhereRaw('data::text ILIKE ?', `%${params.query}%`)
                    .orWhereRaw('tags::text ILIKE ?', `%${params.query}%`)
                    .orWhereRaw('pre_data::text ILIKE ?', `%${params.query}%`),
            );
        }

        return query;
    }

    async getEventCreators(): Promise<Array<{ id: number; name: string }>> {
        const query = this.db('events')
            .distinctOn('events.created_by_user_id')
            .leftJoin('users', 'users.id', '=', 'events.created_by_user_id')
            .select([
                'events.created_by_user_id as id',
                this.db.raw(`
            CASE
                WHEN events.created_by_user_id = -1337 THEN '${SYSTEM_USER.name}'
                WHEN events.created_by_user_id = -42 THEN '${ADMIN_TOKEN_USER.name}'
                ELSE COALESCE(users.name, events.created_by)
            END as name
        `),
                'users.username',
                'users.email',
            ]);

        const result = await query;
        return result
            .filter((row: any) => row.name || row.username || row.email)
            .map((row: any) => ({
                id: Number(row.id),
                name: String(row.name || row.username || row.email),
            }));
    }

    async deprecatedSearchEvents(
        search: DeprecatedSearchEventsSchema = {},
    ): Promise<IEvent[]> {
        let query = this.db
            .select(EVENT_COLUMNS)
            .from<IEventTable>(TABLE)
            .limit(search.limit ?? 100)
            .offset(search.offset ?? 0)
            .orderBy('created_at', 'desc');

        if (search.type) {
            query = query.andWhere({
                type: search.type,
            });
        }

        if (search.project) {
            query = query.andWhere({
                project: search.project,
            });
        }

        if (search.feature) {
            query = query.andWhere({
                feature_name: search.feature,
            });
        }

        if (search.query) {
            query = query.where((where) =>
                where
                    .orWhereRaw('type::text ILIKE ?', `%${search.query}%`)
                    .orWhereRaw('created_by::text ILIKE ?', `%${search.query}%`)
                    .orWhereRaw('data::text ILIKE ?', `%${search.query}%`)
                    .orWhereRaw('tags::text ILIKE ?', `%${search.query}%`)
                    .orWhereRaw('pre_data::text ILIKE ?', `%${search.query}%`),
            );
        }

        try {
            return (await query).map(this.rowToEvent);
        } catch (err) {
            return [];
        }
    }

    rowToEvent(row: IEventTable): IEvent {
        return {
            id: row.id,
            type: row.type as IEventType,
            createdBy: row.created_by,
            createdAt: row.created_at,
            createdByUserId: row.created_by_user_id,
            data: row.data,
            preData: row.pre_data,
            tags: row.tags || [],
            featureName: row.feature_name,
            project: row.project,
            environment: row.environment,
        };
    }

    eventToDbRow(e: IBaseEvent): Omit<IEventTable, 'id' | 'created_at'> {
        return {
            type: e.type,
            created_by: e.createdBy ?? 'admin',
            created_by_user_id: e.createdByUserId,
            data: Array.isArray(e.data) ? JSON.stringify(e.data) : e.data,
            pre_data: Array.isArray(e.preData)
                ? JSON.stringify(e.preData)
                : e.preData,
            // @ts-expect-error workaround for json-array
            tags: JSON.stringify(e.tags),
            feature_name: e.featureName,
            project: e.project,
            environment: e.environment,
            ip: e.ip,
        };
    }

    setMaxListeners(number: number): EventEmitter {
        return this.eventEmitter.setMaxListeners(number);
    }

    on(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventEmitter.on(eventName, listener);
    }

    emit(eventName: string | symbol, ...args: any[]): boolean {
        return this.eventEmitter.emit(eventName, ...args);
    }

    off(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventEmitter.off(eventName, listener);
    }

    async setUnannouncedToAnnounced(): Promise<IEvent[]> {
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .returning(EVENT_COLUMNS);
        return rows.map(this.rowToEvent);
    }

    async publishUnannouncedEvents(): Promise<void> {
        const events = await this.setUnannouncedToAnnounced();

        events.forEach((e) => this.eventEmitter.emit(e.type, e));
    }

    async setCreatedByUserId(batchSize: number): Promise<number | undefined> {
        const API_TOKEN_TABLE = 'api_tokens';

        const toUpdate = await this.db(`${TABLE} as e`)
            .joinRaw(
                'LEFT OUTER JOIN users AS u ON e.created_by = u.username OR e.created_by = u.email',
            )
            .joinRaw(
                `LEFT OUTER JOIN ${API_TOKEN_TABLE} AS t on e.created_by = t.username`,
            )
            .whereRaw(
                `e.created_by_user_id IS null AND
                 e.created_by IS NOT null AND
                (u.id IS NOT null OR
                  t.username IS NOT null OR
                  e.created_by in ('unknown', 'migration', 'init-api-tokens')
                )`,
            )
            .orderBy('e.created_at', 'desc')
            .limit(batchSize)
            .select(['e.*', 'u.id AS userid', 't.username']);

        const updatePromises = toUpdate.map(async (row) => {
            if (
                row.created_by === 'unknown' ||
                row.created_by === 'migration' ||
                (row.created_by === 'init-api-tokens' &&
                    row.type === 'api-token-created')
            ) {
                return this.db(TABLE)
                    .update({ created_by_user_id: SYSTEM_USER_ID })
                    .where({ id: row.id });
            }
            if (row.userid) {
                return this.db(TABLE)
                    .update({ created_by_user_id: row.userid })
                    .where({ id: row.id });
            }
            if (row.username) {
                return this.db(TABLE)
                    .update({ created_by_user_id: ADMIN_TOKEN_USER.id })
                    .where({ id: row.id });
            }
            this.logger.warn(`Could not find user for event ${row.id}`);
            return Promise.resolve();
        });

        await Promise.all(updatePromises);
        return toUpdate.length;
    }
}

export default EventStore;
