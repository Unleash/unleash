import type { ISegmentStore } from './segment-store-type.js';
import type {
    IConstraint,
    IFeatureStrategySegment,
    ISegment,
} from '../../types/model.js';
import type { Logger, LogProvider } from '../../logger.js';
import type EventEmitter from 'events';
import NotFoundError from '../../error/notfound-error.js';
import type { PartialSome } from '../../types/partial.js';
import type { IAuditUser } from '../../types/user.js';
import type { Db } from '../../db/db.js';
import type { IFlagResolver } from '../../types/index.js';
import { isDefined } from '../../util/index.js';

const T = {
    segments: 'segments',
    featureStrategies: 'feature_strategies',
    features: 'features',
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
        user: Pick<IAuditUser, 'username'>,
    ): Promise<ISegment> {
        const rows = await this.db(T.segments)
            .insert({
                id: segment.id,
                name: segment.name,
                description: segment.description,
                segment_project_id: segment.project || null,
                constraints: JSON.stringify(segment.constraints),
                created_by: user.username,
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

    async getAll(
        includeChangeRequestUsageData: boolean = false,
    ): Promise<ISegment[]> {
        if (includeChangeRequestUsageData) {
            return this.getAllWithChangeRequestUsageData();
        } else {
            return this.getAllWithoutChangeRequestUsageData();
        }
    }

    private async getAllWithoutChangeRequestUsageData(): Promise<ISegment[]> {
        const rows: ISegmentRow[] = await this.db
            .select([
                ...this.prefixColumns(),
                this.db.raw(
                    `count(distinct case when ${T.features}.archived_at is null then ${T.featureStrategies}.project_name end) as used_in_projects`,
                ),
                this.db.raw(
                    `count(distinct case when ${T.features}.archived_at is null then ${T.featureStrategies}.feature_name end) as used_in_features`,
                ),
            ])
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
            .leftJoin(
                T.features,
                `${T.featureStrategies}.feature_name`,
                `${T.features}.name`,
            )
            .groupBy(this.prefixColumns())
            .orderBy('name', 'asc');

        return rows.map(this.mapRow);
    }

    private async getAllWithChangeRequestUsageData(): Promise<ISegment[]> {
        const pendingCRs = await this.db
            .select('id', 'project')
            .from('change_requests')
            .whereNotIn('state', ['Applied', 'Rejected', 'Cancelled']);

        const pendingChangeRequestIds = pendingCRs.map((cr) => cr.id);

        const crFeatures = await this.db
            .select(
                'payload',
                'feature',
                'change_request_id as changeRequestId',
            )
            .from('change_request_events')
            .whereIn('change_request_id', pendingChangeRequestIds)
            .whereIn('action', ['addStrategy', 'updateStrategy'])
            .andWhereRaw("jsonb_array_length(payload -> 'segments') > 0");

        const combinedUsageData = this.combineUsageData(pendingCRs, crFeatures);

        const currentSegmentUsage = await this.db
            .select(
                `${T.featureStrategies}.feature_name as featureName`,
                `${T.featureStrategies}.project_name as projectName`,
                'segment_id as segmentId',
            )
            .from(T.featureStrategySegment)
            .leftJoin(
                T.featureStrategies,
                `${T.featureStrategies}.id`,
                `${T.featureStrategySegment}.feature_strategy_id`,
            )
            .leftJoin(
                T.features,
                `${T.featureStrategies}.feature_name`,
                `${T.features}.name`,
            )
            .where(`${T.features}.archived_at`, null);

        this.mergeCurrentUsageWithCombinedData(
            combinedUsageData,
            currentSegmentUsage,
        );

        const rows: ISegmentRow[] = await this.db
            .select(this.prefixColumns())
            .from(T.segments)
            .leftJoin(
                T.featureStrategySegment,
                `${T.segments}.id`,
                `${T.featureStrategySegment}.segment_id`,
            )
            .groupBy(this.prefixColumns())
            .orderBy('name', 'asc');

        const rowsWithUsageData = this.mapRowsWithUsageData(
            rows,
            combinedUsageData,
        );

        return rowsWithUsageData.map(this.mapRow);
    }

    private mapRowsWithUsageData(
        rows: ISegmentRow[],
        combinedUsageData: any,
    ): ISegmentRow[] {
        return rows.map((row) => {
            const usageData = combinedUsageData[row.id];
            if (usageData) {
                return {
                    ...row,
                    used_in_features: usageData.features.size,
                    used_in_projects: usageData.projects.size,
                };
            } else {
                return {
                    ...row,
                    used_in_features: 0,
                    used_in_projects: 0,
                };
            }
        });
    }

    private combineUsageData = (pendingCRs, crFeatures) => {
        const changeRequestToProjectMap = pendingCRs.reduce(
            (acc, { id, project }) => {
                acc[id] = project;
                return acc;
            },
            {},
        );

        const combinedUsageData = crFeatures.reduce((acc, segmentEvent) => {
            const { payload, changeRequestId, feature } = segmentEvent;
            const project = changeRequestToProjectMap[changeRequestId];

            for (const segmentId of payload.segments) {
                const existingData = acc[segmentId];
                if (existingData) {
                    acc[segmentId] = {
                        features: existingData.features.add(feature),
                        projects: existingData.projects.add(project),
                    };
                } else {
                    acc[segmentId] = {
                        features: new Set([feature]),
                        projects: new Set([project]),
                    };
                }
            }
            return acc;
        }, {});
        return combinedUsageData;
    };

    private mergeCurrentUsageWithCombinedData(
        combinedUsageData: any,
        currentSegmentUsage: any[],
    ) {
        currentSegmentUsage.forEach(
            ({ segmentId, featureName, projectName }) => {
                const usage = combinedUsageData[segmentId];
                if (usage) {
                    usage.features.add(featureName);
                    usage.projects.add(projectName);
                } else {
                    combinedUsageData[segmentId] = {
                        features: new Set([featureName]),
                        projects: new Set([projectName]),
                    };
                }
            },
        );
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

    async getProjectSegmentCount(projectId: string): Promise<number> {
        const result = await this.db.raw(
            `SELECT COUNT(*) FROM ${T.segments} WHERE segment_project_id = ?`,
            [projectId],
        );

        return Number(result.rows[0].count);
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
            ...(isDefined(row.used_in_projects) && {
                usedInProjects: Number(row.used_in_projects),
            }),
            ...(isDefined(row.used_in_features) && {
                usedInFeatures: Number(row.used_in_features),
            }),
        };
    }

    destroy(): void {}
}
