import type EventEmitter from 'events';
import type {
    FeatureEnvironmentKey,
    IFeatureEnvironmentStore,
} from '../types/stores/feature-environment-store.js';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';
import type { IFeatureEnvironment, IVariant } from '../types/model.js';
import NotFoundError from '../error/notfound-error.js';
import type { Db } from './db.js';
import type { IUnleashConfig } from '../types/index.js';
import { randomId } from '../util/index.js';

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

export class FeatureEnvironmentStore implements IFeatureEnvironmentStore {
    private db: Db;

    private readonly timer: Function;

    private readonly isOss: boolean;
    constructor(
        db: Db,
        eventBus: EventEmitter,
        { isOss }: Pick<IUnleashConfig, 'isOss'>,
    ) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-environments',
                action,
            });
        this.isOss = isOss;
    }

    async delete({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<void> {
        const stopTimer = this.timer('delete');
        await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .del();
        stopTimer();
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db(T.featureEnvs).del();
        stopTimer();
    }

    destroy(): void {}

    async exists({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?) AS present`,
            [featureName, environment],
        );
        stopTimer();
        const { present } = result.rows[0];
        return present;
    }

    async get({
        featureName,
        environment,
    }: FeatureEnvironmentKey): Promise<IFeatureEnvironment> {
        const stopTimer = this.timer('get');
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        stopTimer();
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

    addOssFilterIfNeeded(queryBuilder) {
        if (this.isOss) {
            return queryBuilder
                .join(
                    'environments',
                    'environments.name',
                    '=',
                    `${T.featureEnvs}.environment`,
                )
                .whereIn('environments.name', [
                    'default',
                    'development',
                    'production',
                ])
                .select([
                    'feature_name',
                    'environment',
                    'variants',
                    'last_seen_at',
                    `${T.featureEnvs}.enabled`,
                ]);
        }
        return queryBuilder;
    }

    async getAll(query?: Object): Promise<IFeatureEnvironment[]> {
        const stopTimer = this.timer('getAll');
        let rows = this.db(T.featureEnvs);
        if (query) {
            rows = rows.where(query);
        }
        this.addOssFilterIfNeeded(rows);
        const result = await rows;
        stopTimer();
        return result.map((r) => ({
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
        const stopTimer = this.timer('getAllByFeatures');
        let rows = this.db(T.featureEnvs)
            .whereIn('feature_name', features)
            .orderBy('feature_name', 'asc');
        if (environment) {
            rows = rows.where({ environment });
        }
        this.addOssFilterIfNeeded(rows);
        const result = await rows;
        stopTimer();
        return result.map((r) => ({
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
        const stopTimer = this.timer('disableEnvironmentIfNoStrategies');
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
        stopTimer();
    }

    async addEnvironmentToFeature(
        featureName: string,
        environment: string,
        enabled: boolean = false,
    ): Promise<void> {
        const stopTimer = this.timer('addEnvironmentToFeature');
        await this.db('feature_environments')
            .insert({ feature_name: featureName, environment, enabled })
            .onConflict(['environment', 'feature_name'])
            .merge(['enabled']);
        stopTimer();
    }

    // TODO: move to project store.
    async disconnectFeatures(
        environment: string,
        project: string,
    ): Promise<void> {
        const stopTimer = this.timer('disconnectFeatures');
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
        stopTimer();
    }

    async featureHasEnvironment(
        environment: string,
        featureName: string,
    ): Promise<boolean> {
        const stopTimer = this.timer('featureHasEnvironment');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?)  AS present`,
            [featureName, environment],
        );
        stopTimer();
        const { present } = result.rows[0];
        return present;
    }

    async getEnvironmentsForFeature(
        featureName: string,
    ): Promise<IFeatureEnvironment[]> {
        const stopTimer = this.timer('getEnvironmentsForFeature');
        const envs = await this.db(T.featureEnvs).where(
            'feature_name',
            featureName,
        );
        stopTimer();
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
        const stopTimer = this.timer('getEnvironmentMetaData');
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        stopTimer();
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
        const stopTimer = this.timer('isEnvironmentEnabled');
        const row = await this.db(T.featureEnvs)
            .select('enabled')
            .where({ feature_name: featureName, environment })
            .first();
        stopTimer();
        return row.enabled;
    }

    async removeEnvironmentForFeature(
        featureName: string,
        environment: string,
    ): Promise<void> {
        const stopTimer = this.timer('removeEnvironmentForFeature');
        await this.db(T.featureEnvs)
            .where({ feature_name: featureName, environment })
            .del();
        stopTimer();
    }

    async setEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<number> {
        const stopTimer = this.timer('setEnvironmentEnabledStatus');
        const result = await this.db(T.featureEnvs).update({ enabled }).where({
            environment,
            feature_name: featureName,
            enabled: !enabled,
        });
        stopTimer();
        return result;
    }

    async connectProject(
        environment: string,
        projectId: string,
        idempotent?: boolean, // default false to respect old behavior
    ): Promise<void> {
        const stopTimer = this.timer('connectProject');
        const query = this.db('project_environments').insert({
            environment_name: environment,
            project_id: projectId,
        });
        if (idempotent) {
            await query.onConflict(['environment_name', 'project_id']).ignore();
        } else {
            await query;
        }
        stopTimer();
    }

    async connectFeatures(
        environment: string,
        projectId: string,
    ): Promise<void> {
        const stopTimer = this.timer('connectFeatures');
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
        stopTimer();
    }

    async disconnectProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        const stopTimer = this.timer('disconnectProject');
        await this.db('project_environments')
            .where({ environment_name: environment, project_id: projectId })
            .del();
        stopTimer();
    }

    async connectFeatureToEnvironmentsForProject(
        featureName: string,
        projectId: string,
        enabledIn: { [environment: string]: boolean } = {},
    ): Promise<void> {
        const stopTimer = this.timer('connectFeatureToEnvironmentsForProject');
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
        stopTimer();
    }

    async copyEnvironmentFeaturesByProjects(
        sourceEnvironment: string,
        destinationEnvironment: string,
        projects: string[],
    ): Promise<void> {
        const stopTimer = this.timer('copyEnvironmentFeaturesByProjects');
        await this.db.raw(
            `INSERT INTO ${T.featureEnvs} (environment, feature_name, enabled, variants)
             SELECT DISTINCT ? AS environemnt, fe.feature_name, fe.enabled, fe.variants
             FROM ${T.featureEnvs} AS fe
                      INNER JOIN ${T.features} AS f ON fe.feature_name = f.name
             WHERE fe.environment = ? AND f.project = ANY(?)`,
            [destinationEnvironment, sourceEnvironment, projects],
        );
        stopTimer();
    }

    async addVariantsToFeatureEnvironment(
        featureName: string,
        environment: string,
        variants: IVariant[],
    ): Promise<void> {
        const stopTimer = this.timer('addVariantsToFeatureEnvironment');
        const result = await this.setVariantsToFeatureEnvironments(
            featureName,
            [environment],
            variants,
        );
        stopTimer();
        return result;
    }

    async setVariantsToFeatureEnvironments(
        featureName: string,
        environments: string[],
        variants: IVariant[],
    ): Promise<void> {
        const stopTimer = this.timer('setVariantsToFeatureEnvironments');
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
        stopTimer();
    }

    async addFeatureEnvironment(
        featureEnvironment: IFeatureEnvironment,
    ): Promise<void> {
        const stopTimer = this.timer('addFeatureEnvironment');
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
        stopTimer();
    }

    async cloneStrategies(
        sourceEnvironment: string,
        destinationEnvironment: string,
        projects: string[],
    ): Promise<void> {
        const stopTimer = this.timer('cloneStrategies');

        await this.db.transaction(async (trx) => {
            const sourceFeatureStrategies = await trx(
                'feature_strategies as fs',
            )
                .join('features as f', 'f.name', 'fs.feature_name')
                .select('fs.*')
                .where('fs.environment', sourceEnvironment)
                .whereIn('f.project', projects);

            if (sourceFeatureStrategies.length === 0) {
                return;
            }

            const clonedStrategyRows = sourceFeatureStrategies.map(
                (featureStrategy) => ({
                    ...featureStrategy,
                    id: randomId(),
                    environment: destinationEnvironment,
                    parameters: JSON.stringify(featureStrategy.parameters),
                    constraints: JSON.stringify(featureStrategy.constraints),
                    variants: JSON.stringify(featureStrategy.variants),
                }),
            );

            await trx('feature_strategies').insert(clonedStrategyRows);

            const newStrategyIdByOld = new Map<string, string>();
            sourceFeatureStrategies.forEach((s, i) => {
                newStrategyIdByOld.set(s.id, clonedStrategyRows[i].id);
            });

            const segmentsToClone = await trx('feature_strategy_segment as fss')
                .join(
                    'feature_strategies as fs',
                    'fss.feature_strategy_id',
                    'fs.id',
                )
                .join('features as f', 'f.name', 'fs.feature_name')
                .select('fss.feature_strategy_id', 'fss.segment_id')
                .where('fs.environment', sourceEnvironment)
                .whereIn('f.project', projects);

            if (segmentsToClone.length) {
                const clonedSegmentRows = segmentsToClone
                    .map((row) => {
                        const mappedId = newStrategyIdByOld.get(
                            row.feature_strategy_id,
                        );
                        if (!mappedId) return null;
                        return {
                            feature_strategy_id: mappedId,
                            segment_id: row.segment_id,
                        };
                    })
                    .filter(
                        (
                            r,
                        ): r is {
                            feature_strategy_id: string;
                            segment_id: number;
                        } => Boolean(r),
                    );

                if (clonedSegmentRows.length) {
                    await trx('feature_strategy_segment').insert(
                        clonedSegmentRows,
                    );
                }
            }
        });

        stopTimer();
    }

    async variantExists(featureName: string): Promise<boolean> {
        const stopTimer = this.timer('variantExists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND variants <> '[]'::jsonb) AS present`,
            [featureName],
        );
        stopTimer();
        const { present } = result.rows[0];
        return present;
    }
}
