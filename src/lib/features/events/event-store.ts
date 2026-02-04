import {
    FEATURE_CREATED,
    FEATURE_IMPORT,
    FEATURE_TAGGED,
    FEATURE_UNTAGGED,
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    FEATURES_IMPORTED,
    type IBaseEvent,
    type IEvent,
    type IEventType,
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
} from '../../events/index.js';
import type { Logger, LogProvider } from '../../logger.js';
import type {
    IEventSearchParams,
    IEventStore,
} from '../../types/stores/event-store.js';
import { ALL_ENVS, sharedEventEmitter } from '../../util/index.js';
import type { Db } from '../../db/db.js';
import type { Knex } from 'knex';
import type EventEmitter from 'node:events';
import {
    ADMIN_TOKEN_USER,
    SYSTEM_USER,
    SYSTEM_USER_ID,
} from '../../types/index.js';
import type { ProjectActivitySchema } from '../../openapi/index.js';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import { applyGenericQueryParams } from '../feature-search/search-utils.js';
import type { ITag } from '../../tags/index.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';

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
    'group_type',
    'group_id',
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
    ip?: string;
    group_type: string | null;
    group_id: string | null;
}

const TABLE = 'events';

export class EventStore implements IEventStore {
    private db: Db;

    // only one shared event emitter should exist across all event store instances
    private eventEmitter: EventEmitter = sharedEventEmitter;

    private logger: Logger;

    private metricTimer: Function;

    // a new DB has to be injected per transaction
    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('event-store');
        this.metricTimer = (action) =>
            metricsHelper.wrapTimer(this.eventEmitter, DB_TIME, {
                store: 'event',
                action,
            });
    }

    async store(event: IBaseEvent): Promise<void> {
        const stopTimer = this.metricTimer('store');
        try {
            await this.db(TABLE)
                .insert(this.eventToDbRow(event))
                .returning(EVENT_COLUMNS);
        } catch (error: unknown) {
            this.logger.warn(`Failed to store "${event.type}" event: ${error}`);
        } finally {
            stopTimer();
        }
    }

    async count(): Promise<number> {
        const stopTimer = this.metricTimer('count');
        const count = await this.db(TABLE)
            .count<Record<string, number>>()
            .first();
        stopTimer();
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
        queryParams: IQueryParam[],
        query?: IEventSearchParams['query'],
    ): Promise<number> {
        const stopTimer = this.metricTimer('searchEventsCount');
        const searchQuery = this.buildSearchQuery(queryParams, query);
        const count = await searchQuery.count().first();
        stopTimer();
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
        const stopTimer = this.metricTimer('batchStore');
        try {
            await this.db(TABLE).insert(
                events.map((event) => this.eventToDbRow(event)),
            );
        } catch (error: unknown) {
            this.logger.warn(
                `Failed to store events: ${JSON.stringify(events)}`,
                error,
            );
        } finally {
            stopTimer();
        }
    }

    private eventTypeIsInteresting =
        (opts?: { additionalTypes?: string[]; environment?: string }) =>
        (builder: Knex.QueryBuilder) =>
            builder
                .andWhere((inner) => {
                    inner
                        .whereNotNull('feature_name')
                        .whereNotIn('type', [
                            FEATURE_TAGGED,
                            FEATURE_UNTAGGED,
                            FEATURE_FAVORITED,
                            FEATURE_UNFAVORITED,
                        ])
                        .whereNot('type', 'LIKE', 'change-%');
                    if (opts?.environment && opts.environment !== ALL_ENVS) {
                        inner.andWhere((envInner) => {
                            envInner
                                .where('environment', opts.environment)
                                // Picks up events like archiving, which relate to a feature but have no specific environment set
                                .orWhereNull('environment');
                        });
                    }
                    return inner;
                })
                .orWhereIn('type', [
                    SEGMENT_UPDATED,
                    FEATURE_IMPORT,
                    FEATURES_IMPORTED,
                    ...(opts?.additionalTypes ?? []),
                ]);

    /** This method is used for polling */
    async getMaxRevisionId(
        largerThan: number = 0,
        environment?: string,
    ): Promise<number> {
        const stopTimer = this.metricTimer('getMaxRevisionId');
        const row = await this.db(TABLE)
            .max('id')
            .where(this.eventTypeIsInteresting({ environment }))
            .andWhere('id', '>=', largerThan)
            .first();

        stopTimer();
        return row?.max ?? 0;
    }

    /** This method is used for delta/streaming */
    async getRevisionRange(start: number, end: number): Promise<IEvent[]> {
        const stopTimer = this.metricTimer('getRevisionRange');
        const query = this.db
            .select(EVENT_COLUMNS)
            .from(TABLE)
            .where('id', '>', start)
            .andWhere('id', '<=', end)
            .andWhere(
                this.eventTypeIsInteresting({
                    additionalTypes: [SEGMENT_CREATED, SEGMENT_DELETED],
                }),
            )
            .orderBy('id', 'asc');

        const rows = await query;
        stopTimer();
        return rows.map(this.rowToEvent);
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
        const stopTimer = this.metricTimer('query');
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
        } catch (_e) {
            return [];
        } finally {
            stopTimer();
        }
    }

    async queryCount(operations: IQueryOperations[]): Promise<number> {
        const stopTimer = this.metricTimer('queryCount');
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
            return Number.parseInt(queryResult.count || 0, 10);
        } catch (_e) {
            return 0;
        } finally {
            stopTimer();
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
        const stopTimer = this.metricTimer('getEvents');
        try {
            let qB = this.db
                .select(EVENT_COLUMNS)
                .from(TABLE)
                .limit(100)
                .orderBy([
                    { column: 'created_at', order: 'desc' },
                    { column: 'id', order: 'desc' },
                ]);
            if (query) {
                qB = qB.where(query);
            }
            const rows = await qB;
            return rows.map(this.rowToEvent);
        } catch (_err) {
            return [];
        } finally {
            stopTimer();
        }
    }

    async searchEvents(
        params: IEventSearchParams,
        queryParams: IQueryParam[],
        options?: { withIp?: boolean },
    ): Promise<IEvent[]> {
        const stopTimer = this.metricTimer('searchEvents');
        const query = this.buildSearchQuery(queryParams, params.query)
            .select(options?.withIp ? [...EVENT_COLUMNS, 'ip'] : EVENT_COLUMNS)
            .orderBy([
                { column: 'created_at', order: params.order || 'desc' },
                { column: 'id', order: params.order || 'desc' },
            ])
            .limit(Number(params.limit) ?? 100)
            .offset(Number(params.offset) ?? 0);

        try {
            return (await query).map((row) =>
                options?.withIp
                    ? { ...this.rowToEvent(row), ip: row.ip }
                    : this.rowToEvent(row),
            );
        } catch (_err) {
            return [];
        } finally {
            stopTimer();
        }
    }

    private buildSearchQuery(
        queryParams: IQueryParam[],
        query?: IEventSearchParams['query'],
    ) {
        let searchQuery = this.db.from<IEventTable>(TABLE);

        applyGenericQueryParams(searchQuery, queryParams);

        if (query) {
            searchQuery = searchQuery.where((where) =>
                where
                    .orWhereRaw('data::text ILIKE ?', `%${query}%`)
                    .orWhereRaw('tags::text ILIKE ?', `%${query}%`)
                    .orWhereRaw('pre_data::text ILIKE ?', `%${query}%`),
            );
        }

        return searchQuery;
    }

    async getEventCreators(): Promise<Array<{ id: number; name: string }>> {
        const stopTimer = this.metricTimer('getEventCreators');
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
        stopTimer();
        return result
            .filter((row: any) => row.name || row.username || row.email)
            .map((row: any) => ({
                id: Number(row.id),
                name: String(row.name || row.username || row.email),
            }));
    }

    async getProjectRecentEventActivity(
        project: string,
    ): Promise<ProjectActivitySchema> {
        const stopTimer = this.metricTimer('getProjectRecentEventActivity');
        const result = await this.db('events')
            .select(
                this.db.raw("TO_CHAR(created_at::date, 'YYYY-MM-DD') AS date"),
            )
            .count('* AS count')
            .where('project', project)
            .andWhere(
                'created_at',
                '>=',
                this.db.raw("NOW() - INTERVAL '1 year'"),
            )
            .groupBy(this.db.raw("TO_CHAR(created_at::date, 'YYYY-MM-DD')"))
            .orderBy('date', 'asc');

        stopTimer();
        return result.map((row) => ({
            date: row.date,
            count: Number(row.count),
        }));
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
            groupType: row.group_type || undefined,
            groupId: row.group_id || undefined,
        };
    }

    eventToDbRow(e: IBaseEvent): Omit<IEventTable, 'id' | 'created_at'> {
        const transactionContext = this.db.userParams;

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
            group_type: transactionContext?.type || null,
            group_id: transactionContext?.id || null,
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
        const stopTimer = this.metricTimer('setUnannouncedToAnnounced');
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .returning(EVENT_COLUMNS);
        stopTimer();
        return rows.map(this.rowToEvent);
    }

    async publishUnannouncedEvents(): Promise<void> {
        const events = await this.setUnannouncedToAnnounced();

        events.forEach((e) => {
            this.eventEmitter.emit(e.type, e);
        });
    }

    async setCreatedByUserId(batchSize: number): Promise<number | undefined> {
        const stopTimer = this.metricTimer('setCreatedByUserId');
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
        stopTimer();
        return toUpdate.length;
    }
}

export default EventStore;
