import { IEvent, IBaseEvent, SEGMENT_UPDATED } from '../types/events';
import { LogProvider, Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { ITag } from '../types/model';
import { SearchEventsSchema } from '../openapi/spec/search-events-schema';
import { sharedEventEmitter } from '../util/anyEventEmitter';
import { Db } from './db';
import { Knex } from 'knex';
import EventEmitter from 'events';

const EVENT_COLUMNS = [
    'id',
    'type',
    'created_by',
    'created_at',
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
        this.logger = getLogger('lib/db/event-store.ts');
    }

    async store(event: IBaseEvent): Promise<void> {
        try {
            const rows = await this.db(TABLE)
                .insert(this.eventToDbRow(event))
                .returning(EVENT_COLUMNS);
            const savedEvent = this.rowToEvent(rows[0]);
            process.nextTick(() =>
                this.eventEmitter.emit(event.type, savedEvent),
            );
        } catch (error: unknown) {
            this.logger.warn(`Failed to store "${event.type}" event: ${error}`);
        }
    }

    async count(): Promise<number> {
        let count = await this.db(TABLE)
            .count<Record<string, number>>()
            .first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return parseInt(count.count, 10);
        } else {
            return count.count;
        }
    }

    async filteredCount(eventSearch: SearchEventsSchema): Promise<number> {
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
        let count = await query.count().first();
        if (!count) {
            return 0;
        }
        if (typeof count.count === 'string') {
            return parseInt(count.count, 10);
        } else {
            return count.count;
        }
    }

    async batchStore(events: IBaseEvent[]): Promise<void> {
        try {
            const savedRows = await this.db(TABLE)
                .insert(events.map(this.eventToDbRow))
                .returning(EVENT_COLUMNS);
            const savedEvents = savedRows.map(this.rowToEvent);
            process.nextTick(() =>
                savedEvents.forEach((e) => this.eventEmitter.emit(e.type, e)),
            );
        } catch (error: unknown) {
            this.logger.warn(`Failed to store events: ${error}`);
        }
    }

    async getMaxRevisionId(largerThan: number = 0): Promise<number> {
        const row = await this.db(TABLE)
            .max('id')
            .where((builder) =>
                builder
                    .whereNotNull('feature_name')
                    .orWhere('type', SEGMENT_UPDATED),
            )
            .andWhere('id', '>=', largerThan)
            .first();
        return row ? row.max : -1;
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
            return parseInt(queryResult.count || 0);
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

    async searchEvents(search: SearchEventsSchema = {}): Promise<IEvent[]> {
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
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
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
            created_by: e.createdBy,
            data: e.data,
            pre_data: e.preData,
            // @ts-expect-error workaround for json-array
            tags: JSON.stringify(e.tags),
            feature_name: e.featureName,
            project: e.project,
            environment: e.environment,
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
}

export default EventStore;
