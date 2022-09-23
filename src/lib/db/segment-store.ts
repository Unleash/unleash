import { ISegmentStore } from '../types/stores/segment-store';
import { IConstraint, IFeatureStrategySegment, ISegment } from '../types/model';
import { Logger, LogProvider } from '../logger';
import { Knex } from 'knex';
import EventEmitter from 'events';
import NotFoundError from '../error/notfound-error';
import { PartialSome } from '../types/partial';
import User from '../types/user';

const T = {
    segments: 'segments',
    featureStrategies: 'feature_strategies',
    featureStrategySegment: 'feature_strategy_segment',
};

const COLUMNS = [
    'id',
    'name',
    'description',
    'created_by',
    'created_at',
    'constraints',
];

interface ISegmentRow {
    id: number;
    name: string;
    description?: string;
    created_by?: string;
    created_at?: Date;
    constraints: IConstraint[];
}

interface IFeatureStrategySegmentRow {
    feature_strategy_id: string;
    segment_id: number;
    created_at?: Date;
}

export default class SegmentStore implements ISegmentStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/segment-store.ts');
    }

    async create(
        segment: PartialSome<ISegment, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISegment> {
        const rows = await this.db(T.segments)
            .insert({
                id: segment.id,
                name: segment.name,
                description: segment.description,
                constraints: JSON.stringify(segment.constraints),
                created_by: user.username || user.email,
            })
            .returning(COLUMNS);

        return this.mapRow(rows[0]);
    }

    async update(id: number, segment: Omit<ISegment, 'id'>): Promise<ISegment> {
        const rows = await this.db(T.segments)
            .where({ id })
            .update({
                name: segment.name,
                description: segment.description,
                constraints: JSON.stringify(segment.constraints),
            })
            .returning(COLUMNS);

        return this.mapRow(rows[0]);
    }

    delete(id: number): Promise<void> {
        return this.db(T.segments).where({ id }).del();
    }

    async getAll(): Promise<ISegment[]> {
        const rows: ISegmentRow[] = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .orderBy('name', 'asc');

        return rows.map(this.mapRow);
    }

    async getActive(): Promise<ISegment[]> {
        const rows: ISegmentRow[] = await this.db
            .distinct(this.prefixColumns())
            .from(T.segments)
            .orderBy('name', 'asc')
            .join(
                T.featureStrategySegment,
                `${T.featureStrategySegment}.segment_id`,
                `${T.segments}.id`,
            );

        return rows.map(this.mapRow);
    }

    async getByStrategy(strategyId: string): Promise<ISegment[]> {
        const rows = await this.db
            .select(this.prefixColumns())
            .from<ISegmentRow>(T.segments)
            .join(
                T.featureStrategySegment,
                `${T.featureStrategySegment}.segment_id`,
                `${T.segments}.id`,
            )
            .where(
                `${T.featureStrategySegment}.feature_strategy_id`,
                '=',
                strategyId,
            );
        return rows.map(this.mapRow);
    }

    deleteAll(): Promise<void> {
        return this.db(T.segments).del();
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.segments} WHERE id = ?) AS present`,
            [id],
        );

        return result.rows[0].present;
    }

    async get(id: number): Promise<ISegment> {
        const rows: ISegmentRow[] = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .where({ id });

        return this.mapRow(rows[0]);
    }

    async addToStrategy(id: number, strategyId: string): Promise<void> {
        await this.db(T.featureStrategySegment).insert({
            segment_id: id,
            feature_strategy_id: strategyId,
        });
    }

    async removeFromStrategy(id: number, strategyId: string): Promise<void> {
        await this.db(T.featureStrategySegment)
            .where({ segment_id: id, feature_strategy_id: strategyId })
            .del();
    }

    async getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]> {
        const rows: IFeatureStrategySegmentRow[] = await this.db
            .select(['segment_id', 'feature_strategy_id'])
            .from(T.featureStrategySegment);

        return rows.map((row) => ({
            featureStrategyId: row.feature_strategy_id,
            segmentId: row.segment_id,
        }));
    }

    async existsByName(name: string): Promise<boolean> {
        const rows: ISegmentRow[] = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .where({ name });

        return Boolean(rows[0]);
    }

    prefixColumns(): string[] {
        return COLUMNS.map((c) => `${T.segments}.${c}`);
    }

    mapRow(row?: ISegmentRow): ISegment {
        if (!row) {
            throw new NotFoundError('No row');
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            constraints: row.constraints,
            createdBy: row.created_by,
            createdAt: row.created_at,
        };
    }

    destroy(): void {}
}
