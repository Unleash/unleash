import { randomUUID } from 'crypto';
import {
    FeatureToggle,
    FeatureToggleWithEnvironment,
    IFeatureOverview,
    IFeatureStrategy,
    IFeatureToggleClient,
    IFeatureToggleQuery,
} from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';
import { IFeatureStrategiesStore } from '../../lib/types/stores/feature-strategies-store';

interface ProjectEnvironment {
    projectName: string;
    environment: string;
}

export default class FakeFeatureStrategiesStore
    implements IFeatureStrategiesStore
{
    environmentAndFeature: Map<string, any[]> = new Map();

    projectToEnvironment: ProjectEnvironment[] = [];

    featureStrategies: IFeatureStrategy[] = [];

    featureToggles: FeatureToggle[] = [];

    async createStrategyFeatureEnv(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy> {
        const newStrat = { ...strategyConfig, id: randomUUID() };
        this.featureStrategies.push(newStrat);
        return Promise.resolve(newStrat);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createFeature(feature: any): Promise<void> {
        this.featureToggles.push({
            project: feature.project || 'default',
            createdAt: new Date(),
            archived: false,
            ...feature,
        });
        return Promise.resolve();
    }

    async deleteFeatureStrategies(): Promise<void> {
        this.featureStrategies = [];
        return Promise.resolve();
    }

    async hasStrategy(id: string): Promise<boolean> {
        return this.featureStrategies.some((s) => s.id === id);
    }

    async get(id: string): Promise<IFeatureStrategy> {
        return this.featureStrategies.find((s) => s.id === id);
    }

    async exists(key: string): Promise<boolean> {
        return this.featureStrategies.some((s) => s.id === key);
    }

    async delete(key: string): Promise<void> {
        this.featureStrategies.splice(
            this.featureStrategies.findIndex((s) => s.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.featureStrategies = [];
    }

    destroy(): void {
        throw new Error('Method not implemented.');
    }

    async removeAllStrategiesForFeatureEnv(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        const toRemove = this.featureStrategies.filter(
            (fS) =>
                fS.featureName === feature_name &&
                fS.environment === environment,
        );
        this.featureStrategies = this.featureStrategies.filter(
            (f) =>
                !toRemove.some(
                    (r) =>
                        r.featureName === f.featureName &&
                        r.environment === f.environment,
                ),
        );
        return Promise.resolve();
    }

    async getAll(): Promise<IFeatureStrategy[]> {
        return Promise.resolve(this.featureStrategies);
    }

    async getStrategiesForFeatureEnv(
        project_name: string,
        feature_name: string,
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const rows = this.featureStrategies.filter(
            (fS) =>
                fS.projectId === project_name &&
                fS.featureName === feature_name &&
                fS.environment === environment,
        );
        return Promise.resolve(rows);
    }

    async getFeatureToggleWithEnvs(
        featureName: string,
        archived: boolean = false,
    ): Promise<FeatureToggleWithEnvironment> {
        const toggle = this.featureToggles.find(
            (f) => f.name === featureName && f.archived === archived,
        );
        if (toggle) {
            return { ...toggle, environments: [] };
        }
        throw new NotFoundError(
            `Could not find feature with name ${featureName}`,
        );
    }

    async getFeatureOverview(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        archived: boolean,
    ): Promise<IFeatureOverview[]> {
        return Promise.resolve([]);
    }

    async getFeatures(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<IFeatureToggleClient[]> {
        const rows = this.featureToggles.filter((toggle) => {
            if (featureQuery.namePrefix) {
                if (featureQuery.project) {
                    return (
                        toggle.name.startsWith(featureQuery.namePrefix) &&
                        featureQuery.project.includes(toggle.project)
                    );
                }
                return toggle.name.startsWith(featureQuery.namePrefix);
            }
            if (featureQuery.project) {
                return featureQuery.project.includes(toggle.project);
            }
            return toggle.archived === archived;
        });
        const clientRows: IFeatureToggleClient[] = rows.map((t) => ({
            ...t,
            enabled: true,
            strategies: [],
            description: t.description || '',
            type: t.type || 'Release',
            stale: t.stale || false,
            variants: [],
        }));
        return Promise.resolve(clientRows);
    }

    async getStrategyById(id: string): Promise<IFeatureStrategy> {
        const strat = this.featureStrategies.find((fS) => fS.id === id);
        if (strat) {
            return Promise.resolve(strat);
        }
        return Promise.reject(
            new NotFoundError(`Could not find strategy with id ${id}`),
        );
    }

    async connectEnvironmentAndFeature(
        feature_name: string,
        environment: string,
        enabled: boolean = false,
    ): Promise<void> {
        if (!this.environmentAndFeature.has(environment)) {
            this.environmentAndFeature.set(environment, []);
        }
        this.environmentAndFeature
            .get(environment)
            .push({ feature: feature_name, enabled });
        return Promise.resolve();
    }

    async removeEnvironmentForFeature(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        this.environmentAndFeature.set(
            environment,
            this.environmentAndFeature
                .get(environment)
                .filter((e) => e.featureName !== feature_name),
        );
        return Promise.resolve();
    }

    async disconnectEnvironmentFromProject(
        environment: string,
        project: string,
    ): Promise<void> {
        this.projectToEnvironment = this.projectToEnvironment.filter(
            (f) => f.projectName !== project && f.environment !== environment,
        );
        return Promise.resolve();
    }

    async updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy> {
        this.featureStrategies = this.featureStrategies.map((f) => {
            if (f.id === id) {
                return { ...f, ...updates };
            }
            return f;
        });
        return Promise.resolve(this.featureStrategies.find((f) => f.id === id));
    }

    async deleteConfigurationsForProjectAndEnvironment(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectId: String,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment: String,
    ): Promise<void> {
        return Promise.resolve();
    }

    async isEnvironmentEnabled(
        featureName: string,
        environment: string,
    ): Promise<boolean> {
        const enabled =
            this.environmentAndFeature
                .get(environment)
                ?.find((f) => f.featureName === featureName)?.enabled || false;
        return Promise.resolve(enabled);
    }

    async setProjectForStrategiesBelongingToFeature(
        featureName: string,
        newProjectId: string,
    ): Promise<void> {
        this.featureStrategies = this.featureStrategies.map((f) => {
            if (f.featureName === featureName) {
                f.projectId = newProjectId;
            }
            return f;
        });
        return Promise.resolve(undefined);
    }

    async setEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<boolean> {
        return Promise.resolve(enabled);
    }

    getStrategiesBySegment(): Promise<IFeatureStrategy[]> {
        throw new Error('Method not implemented.');
    }
}

module.exports = FakeFeatureStrategiesStore;
