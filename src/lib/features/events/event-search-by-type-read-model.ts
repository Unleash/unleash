import type { IEvent, IEventType } from '../../events/index.js';
import type { Logger, LogProvider } from '../../logger.js';
import type { Db } from '../../db/db.js';
import type { IEventTable } from './event-store.js';

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

const TABLE = 'events';

export interface EventSearchByTypeQueryParams {
    types: string[];
    offset: number;
    limit: number;
    order?: 'asc' | 'desc'; // asc by default
}

export interface EventSearchByTypeReadModel {
    search(params: EventSearchByTypeQueryParams): Promise<IEvent[]>;
}

export class EventSearchByType implements EventSearchByTypeReadModel {
    private db: Db;

    private logger: Logger;

    // a new DB has to be injected per transaction
    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('event-by-type');
    }

    async search(params: EventSearchByTypeQueryParams): Promise<IEvent[]> {
        const query = this.db
            .select(EVENT_COLUMNS)
            .from(TABLE)
            .whereIn('type', params.types)
            .orderBy('id', params.order || 'asc')
            .offset(params.offset)
            .limit(params.limit);

        const rows = await query;
        return rows.map(this.rowToEvent);
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
}
