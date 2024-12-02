import type EventEmitter from 'events';
import type {
    FeatureEnvironmentKey,
    IFeatureEnvironmentStore,
} from '../types/stores/feature-environment-store';
import type { Logger, LogProvider } from '../logger';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import type { IFeatureEnvironment, IVariant } from '../types/model';
import NotFoundError from '../error/notfound-error';
import { v4 as uuidv4 } from 'uuid';
import type { Db } from './db';

const T = {
    featureEnvs: 'feature_environments',
    featureStrategies: 'feature_strategies',
    features: 'features',
};

interface IFeatureEnvironmentRow {
    environment: string;
    feature_name: string;
    enabled: boolean;
    variants?: [];
}

interface ISegmentRow {
    id: string;
    segment_id: number;
}

export class FeatureEnvironmentStore implements IFeatureEnvironmentStore {
    private db: Db;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-environment-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-environments',
                action,
            });
    }

    async delete({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<void> {
        await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.featureEnvs).del();
    }

    destroy(): void {}

    async exists({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?) AS present`,
            [featureName, environment],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<IFeatureEnvironment> {
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        if (md) {
            return {
                enabled: md.enabled,
                featureName,
                environment,
                variants: md.variants,
                lastSeenAt: md.last_seen_at,
            };
        }
        throw new NotFoundError(
            `Could not find ${featureName} in ${environment}`,
        );
    }

    async getAll(query?: Object): Promise<IFeatureEnvironment[]> {
        let rows = this.db(T.featureEnvs);
        if (query) {
            rows = rows.where(query);
        }
        return (await rows).map((r) => ({
            enabled: r.enabled,
            featureName: r.feature_name,
            environment: r.environment,
            variants: r.variants,
        }));
    }

    async getAllByFeatures(
        features: string[],
        environment?: string,
    ): Promise<IFeatureEnvironment[]> {
        let rows = this.db(T.featureEnvs)
            .whereIn('feature_name', features)
            .orderBy('feature_name', 'asc');
        if (environment) {
            rows = rows.where({ environment });
        }
        return (await rows).map((r) => ({
            enabled: r.enabled,
            featureName: r.feature_name,
            environment: r.environment,
            variants: r.variants,
            lastSeenAt: r.last_seen_at,
        }));
    }

    async disableEnvironmentIfNoStrategies(
        featureName: string,
        environment: string,
    ): Promise<void> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureStrategies} WHERE feature_name = ? AND environment = ?) AS enabled`,
            [featureName, environment],
        );
        const { enabled } = result.rows[0];
        if (!enabled) {
            await this.db(T.featureEnvs)
                .update({ enabled: false })
                .where({ feature_name: featureName, environment });
        }
    }

    async addEnvironmentToFeature(
        featureName: string,
        environment: string,
        enabled: boolean = false,
    ): Promise<void> {
        await this.db('feature_environments')
            .insert({ feature_name: featureName, environment, enabled })
            .onConflict(['environment', 'feature_name'])
            .merge(['enabled']);
    }

    // TODO: move to project store.
    async disconnectFeatures(
        environment: string,
        project: string,
    ): Promise<void> {
        const featureSelector = this.db('features')
            .where({ project })
            .select('name');
        await this.db(T.featureEnvs)
            .where({ environment })
            .andWhere('feature_name', 'IN', featureSelector)
            .del();
        await this.db('feature_strategies').where({
            environment,
            project_name: project,
        });
    }

    async featureHasEnvironment(
        environment: string,
        featureName: string,
    ): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?)  AS present`,
            [featureName, environment],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getEnvironmentsForFeature(
        featureName: string,
    ): Promise<IFeatureEnvironment[]> {
        const envs = await this.db(T.featureEnvs).where(
            'feature_name',
            featureName,
        );
        if (envs) {
            return envs.map((r) => ({
                featureName: r.feature_name,
                environment: r.environment,
                variants: r.variants || [],
                enabled: r.enabled,
                lastSeenAt: r.last_seen_at,
            }));
        }
        return [];
    }

    async getEnvironmentMetaData(
        environment: string,
        featureName: string,
    ): Promise<IFeatureEnvironment> {
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        if (md) {
            return {
                enabled: md.enabled,
                featureName,
                environment,
            };
        }
        throw new NotFoundError(
            `Could not find ${featureName} in ${environment}`,
        );
    }

    async isEnvironmentEnabled(
        featureName: string,
        environment: string,
    ): Promise<boolean> {
        const row = await this.db(T.featureEnvs)
            .select('enabled')
            .where({ feature_name: featureName, environment })
            .first();
        return row.enabled;
    }

    async removeEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void> {
        await this.db(T.featureEnvs)
            .where({ feature_name: featureName, environment })
            .del();
    }

    async setEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<number> {
        return this.db(T.featureEnvs).update({ enabled }).where({
            environment,
            feature_name: featureName,
            enabled: !enabled,
        });
    }

    async connectProject(
        environment: string,
        projectId: string,
        idempotent?: boolean, // default false to respect old behavior
    ): Promise<void> {
        const query = this.db('project_environments').insert({
            environment_name: environment,
            project_id: projectId,
        });
        if (idempotent) {
            await query.onConflict(['environment_name', 'project_id']).ignore();
        } else {
            await query;
        }
    }

    async connectFeatures(
        environment: string,
        projectId: string,
    ): Promise<void> {
        const featuresToEnable = await this.db('features')
            .select('name')
            .where({
                project: projectId,
            });
        const rows: IFeatureEnvironmentRow[] = featuresToEnable.map((f) => ({
            environment,
            feature_name: f.name,
            enabled: false,
        }));
        if (rows.length > 0) {
            await this.db<IFeatureEnvironmentRow>('feature_environments')
                .insert(rows)
                .onConflict(['environment', 'feature_name'])
                .ignore();
        }
    }

    async disconnectProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        await this.db('project_environments')
            .where({ environment_name: environment, project_id: projectId })
            .del();
    }

    async connectFeatureToEnvironmentsForProject(
        featureName: string,
        projectId: string,
        enabledIn: { [environment: string]: boolean } = {},
    ): Promise<void> {
        const environmentsToEnable = await this.db('project_environments')
            .select('environment_name')
            .where({ project_id: projectId });
        await Promise.all(
            environmentsToEnable.map(async (env) => {
                await this.db('feature_environments')
                    .insert({
                        environment: env.environment_name,
                        feature_name: featureName,
                        enabled: enabledIn[env.environment_name] || false,
                    })
                    .onConflict(['environment', 'feature_name'])
                    .ignore();
            }),
        );
    }

    async copyEnvironmentFeaturesByProjects(
        sourceEnvironment: string,
        destinationEnvironment: string,
        projects: string[],
    ): Promise<void> {
        await this.db.raw(
            `INSERT INTO ${T.featureEnvs} (environment, feature_name, enabled, variants)
             SELECT DISTINCT ? AS environemnt, fe.feature_name, fe.enabled, fe.variants
             FROM ${T.featureEnvs} AS fe
                      INNER JOIN ${T.features} AS f ON fe.feature_name = f.name
             WHERE fe.environment = ? AND f.project = ANY(?)`,
            [destinationEnvironment, sourceEnvironment, projects],
        );
    }

    async addVariantsToFeatureEnvironment(
        featureName: string,
        environment: string,
        variants: IVariant[],
    ): Promise<void> {
        return this.setVariantsToFeatureEnvironments(
            featureName,
            [environment],
            variants,
        );
    }

    async setVariantsToFeatureEnvironments(
        featureName: string,
        environments: string[],
        variants: IVariant[],
    ): Promise<void> {
        const v = variants || [];
        v.sort((a, b) => a.name.localeCompare(b.name));
        const variantsString = JSON.stringify(v);
        const records = environments.map((env) => ({
            variants: variantsString,
            enabled: false, // default value for enabled in case it's not set
            feature_name: featureName,
            environment: env,
        }));
        await this.db(T.featureEnvs)
            .insert(records)
            .onConflict(['feature_name', 'environment'])
            .merge(['variants']);
    }

    async addFeatureEnvironment(
        featureEnvironment: IFeatureEnvironment,
    ): Promise<void> {
        const v = featureEnvironment.variants || [];
        v.sort((a, b) => a.name.localeCompare(b.name));
        await this.db(T.featureEnvs)
            .insert({
                variants: JSON.stringify(v),
                enabled: featureEnvironment.enabled,
                feature_name: featureEnvironment.featureName,
                environment: featureEnvironment.environment,
            })
            .onConflict(['feature_name', 'environment'])
            .merge(['variants', 'enabled']);
    }

    async cloneStrategies(
        sourceEnvironment: string,
        destinationEnvironment: string,
    ): Promise<void> {
        const sourceFeatureStrategies = await this.db(
            'feature_strategies',
        ).where({
            environment: sourceEnvironment,
        });

        const clonedStrategyRows = sourceFeatureStrategies.map(
            (featureStrategy) => {
                return {
                    id: uuidv4(),
                    feature_name: featureStrategy.feature_name,
                    project_name: featureStrategy.project_name,
                    environment: destinationEnvironment,
                    strategy_name: featureStrategy.strategy_name,
                    parameters: JSON.stringify(featureStrategy.parameters),
                    constraints: JSON.stringify(featureStrategy.constraints),
                    sort_order: featureStrategy.sort_order,
                    variants: JSON.stringify(featureStrategy.variants),
                };
            },
        );

        if (clonedStrategyRows.length === 0) {
            return Promise.resolve();
        }
        await this.db('feature_strategies').insert(clonedStrategyRows);

        const newStrategyMapping = new Map();
        sourceFeatureStrategies.forEach((sourceStrategy, index) => {
            newStrategyMapping.set(
                sourceStrategy.id,
                clonedStrategyRows[index].id,
            );
        });

        const segmentsToClone: ISegmentRow[] = await this.db(
            'feature_strategy_segment as fss',
        )
            .select(['id', 'segment_id'])
            .join(
                'feature_strategies AS fs',
                'fss.feature_strategy_id',
                'fs.id',
            )
            .where('environment', sourceEnvironment);

        const clonedSegmentIdRows = segmentsToClone.map(
            (existingSegmentRow) => {
                return {
                    feature_strategy_id: newStrategyMapping.get(
                        existingSegmentRow.id,
                    ),
                    segment_id: existingSegmentRow.segment_id,
                };
            },
        );

        if (clonedSegmentIdRows.length > 0) {
            await this.db('feature_strategy_segment').insert(
                clonedSegmentIdRows,
            );
        }
    }

    async variantExists(featureName: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND variants <> '[]'::jsonb) AS present`,
            [featureName],
        );
        const { present } = result.rows[0];
        return present;
    }
}
