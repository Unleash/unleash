import EventEmitter from 'events';
import { Knex } from 'knex';
import {
    FeatureEnvironmentKey,
    IFeatureEnvironmentStore,
} from '../types/stores/feature-environment-store';
import { Logger, LogProvider } from '../logger';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { IFeatureEnvironment } from '../types/model';
import NotFoundError from '../error/notfound-error';

const T = { featureEnvs: 'feature_environments' };

export class FeatureEnvironmentStore implements IFeatureEnvironmentStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
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
            };
        }
        throw new NotFoundError(
            `Could not find ${featureName} in ${environment}`,
        );
    }

    async getAll(): Promise<IFeatureEnvironment[]> {
        const rows = await this.db(T.featureEnvs);
        return rows.map((r) => ({
            enabled: r.enabled,
            featureName: r.feature_name,
            environment: r.environment,
        }));
    }

    async connectEnvironmentAndFeature(
        feature_name: string,
        environment: string,
        enabled: boolean = false,
    ): Promise<void> {
        await this.db('feature_environments')
            .insert({ feature_name, environment, enabled })
            .onConflict(['environment', 'feature_name'])
            .merge('enabled');
    }

    async disconnectEnvironmentFromProject(
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

    async enableEnvironmentForFeature(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db(T.featureEnvs)
            .update({ enabled: true })
            .where({ feature_name, environment });
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

    async getAllFeatureEnvironments(): Promise<IFeatureEnvironment[]> {
        const rows = await this.db(T.featureEnvs);
        return rows.map((r) => ({
            environment: r.environment,
            featureName: r.feature_name,
            enabled: r.enabled,
        }));
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
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db(T.featureEnvs).where({ feature_name, environment }).del();
    }

    async toggleEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<boolean> {
        await this.db(T.featureEnvs)
            .update({ enabled })
            .where({ environment, feature_name: featureName });
        return enabled;
    }
}
