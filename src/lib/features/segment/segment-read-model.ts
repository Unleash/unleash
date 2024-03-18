import type {
    IClientSegment,
    IConstraint,
    IFeatureStrategySegment,
    ISegment,
} from '../../types';
import type { ISegmentReadModel } from './segment-read-model-type';
import NotFoundError from '../../error/notfound-error';
import type { Db } from '../../db/db';

interface ISegmentRow {
    id: number;
    name: string;
    description?: string;
    segment_project_id?: string;
    created_by?: string;
    created_at: Date;
    constraints: IConstraint[];
}

const COLUMNS = [
    'id',
    'name',
    'description',
    'segment_project_id',
    'created_by',
    'created_at',
    'constraints',
];

interface IFeatureStrategySegmentRow {
    feature_strategy_id: string;
    segment_id: number;
    created_at?: Date;
}

export class SegmentReadModel implements ISegmentReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    prefixColumns(): string[] {
        return COLUMNS.map((c) => `segments.${c}`);
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
        };
    }

    async getAll(): Promise<ISegment[]> {
        const rows: ISegmentRow[] = await this.db
            .select(this.prefixColumns())
            .from('segments')
            .orderBy('segments.name', 'asc');

        return rows.map(this.mapRow);
    }

    async getAllFeatureStrategySegments(): Promise<IFeatureStrategySegment[]> {
        const rows: IFeatureStrategySegmentRow[] = await this.db
            .select(['segment_id', 'feature_strategy_id'])
            .from('feature_strategy_segment');

        return rows.map((row) => ({
            featureStrategyId: row.feature_strategy_id,
            segmentId: row.segment_id,
        }));
    }

    async getActive(): Promise<ISegment[]> {
        const rows: ISegmentRow[] = await this.db
            .distinct(this.prefixColumns())
            .from('segments')
            .orderBy('name', 'asc')
            .join(
                'feature_strategy_segment',
                'feature_strategy_segment.segment_id',
                'segments.id',
            );

        return rows.map(this.mapRow);
    }

    async getActiveForClient(): Promise<IClientSegment[]> {
        const fullSegments = await this.getActive();

        return fullSegments.map((segments) => ({
            id: segments.id,
            name: segments.name,
            constraints: segments.constraints,
        }));
    }
}
