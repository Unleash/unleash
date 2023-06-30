import { ISegmentStore } from '../types/stores/segment-store';
import { IConstraint, IFeatureStrategySegment, ISegment } from '../types/model';
import { Logger, LogProvider } from '../logger';
import EventEmitter from 'events';
import NotFoundError from '../error/notfound-error';
import { PartialSome } from '../types/partial';
import User from '../types/user';
import { Db } from './db';
import { IFlagResolver } from '../types';

const T = {
    segments: 'segments',
    featureStrategies: 'feature_strategies',
    featureStrategySegment: 'feature_strategy_segment',
};

const COLUMNS = [
    'id',
    'name',
    'description',
    'segment_project_id',
    'created_by',
    'created_at',
    'constraints',
];

interface ISegmentRow {
    id: number;
    name: string;
    description?: string;
    segment_project_id?: string;
    created_by?: string;
    created_at: Date;
    used_in_projects?: number;
    used_in_features?: number;
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

    private db: Db;

    private flagResolver: IFlagResolver;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.eventBus = eventBus;
        this.flagResolver = flagResolver;
        this.logger = getLogger('lib/db/segment-store.ts');
    }

    async count(): Promise<number> {
        return this.db
            .from(T.segments)
            .count('*')
            .then((res) => Number(res[0].count));
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
                segment_project_id: segment.project || null,
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
                segment_project_id: segment.project || null,
                constraints: JSON.stringify(segment.constraints),
            })
            .returning(COLUMNS);

        return this.mapRow(rows[0]);
    }

    delete(id: number): Promise<void> {
        return this.db(T.segments).where({ id }).del();
    }

    async getAll(): Promise<ISegment[]> {
        if (this.flagResolver.isEnabled('segmentContextFieldUsage')) {
            const rows: ISegmentRow[] = await this.db
                .select(
                    this.prefixColumns(),
                    'used_in_projects',
                    'used_in_features',
                )
                .countDistinct(
                    `${T.featureStrategies}.project_name AS used_in_projects`,
                )
                .countDistinct(
                    `${T.featureStrategies}.feature_name AS used_in_features`,
                )
                .from(T.segments)
                .leftJoin(
                    T.featureStrategySegment,
                    `${T.segments}.id`,
                    `${T.featureStrategySegment}.segment_id`,
                )
                .leftJoin(
                    T.featureStrategies,
                    `${T.featureStrategies}.id`,
                    `${T.featureStrategySegment}.feature_strategy_id`,
                )
                .groupBy(this.prefixColumns())
                .orderBy('name', 'asc');

            return rows.map(this.mapRow);
        } else {
            const rows: ISegmentRow[] = await this.db
                .select(this.prefixColumns())
                .from(T.segments)
                .orderBy('name', 'asc');

            return rows.map(this.mapRow);
        }
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

        const row = rows[0];
        if (!row) {
            throw new NotFoundError(`No segment exists with ID "${id}"`);
        }

        return this.mapRow(row);
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
            project: row.segment_project_id || undefined,
            constraints: row.constraints,
            createdBy: row.created_by,
            createdAt: row.created_at,
            ...(row.used_in_projects && {
                usedInProjects: Number(row.used_in_projects),
            }),
            ...(row.used_in_features && {
                usedInFeatures: Number(row.used_in_features),
            }),
        };
    }

    destroy(): void {}
}
