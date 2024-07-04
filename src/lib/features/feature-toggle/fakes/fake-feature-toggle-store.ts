import type {
    IFeatureToggleStore,
    IFeatureToggleStoreQuery,
} from '../types/feature-toggle-store-type';
import NotFoundError from '../../../error/notfound-error';
import type {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureEnvironment,
    IFeatureToggleQuery,
    IFeatureTypeCount,
    IVariant,
} from '../../../types/model';
import type { LastSeenInput } from '../../metrics/last-seen/last-seen-service';
import type {
    EnvironmentFeatureNames,
    FeatureToggleInsert,
} from '../feature-toggle-store';
import type { FeatureConfigurationClient } from '../types/feature-toggle-strategies-store-type';
import type { IFeatureProjectUserParams } from '../feature-toggle-controller';

export default class FakeFeatureToggleStore implements IFeatureToggleStore {
    features: FeatureToggle[] = [];

    async archive(featureName: string): Promise<FeatureToggle> {
        const feature = this.features.find((f) => f.name === featureName);
        if (feature) {
            feature.archived = true;
            return feature;
        }
        throw new NotFoundError(
            `Could not find feature flag with name ${featureName}`,
        );
    }

    async batchArchive(featureNames: string[]): Promise<FeatureToggle[]> {
        const features = this.features.filter((feature) =>
            featureNames.includes(feature.name),
        );
        for (const feature of features) {
            feature.archived = true;
        }
        return features;
    }

    async batchStale(
        featureNames: string[],
        stale: boolean,
    ): Promise<FeatureToggle[]> {
        const features = this.features.filter((feature) =>
            featureNames.includes(feature.name),
        );
        for (const feature of features) {
            feature.stale = stale;
        }
        return features;
    }

    async batchDelete(featureNames: string[]): Promise<void> {
        this.features = this.features.filter(
            (feature) => !featureNames.includes(feature.name),
        );
        return Promise.resolve();
    }

    async batchRevive(featureNames: string[]): Promise<FeatureToggle[]> {
        const features = this.features.filter((f) =>
            featureNames.includes(f.name),
        );
        for (const feature of features) {
            feature.archived = false;
        }
        return features;
    }

    disableAllEnvironmentsForFeatures(names: string[]): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async count(
        query: Partial<IFeatureToggleStoreQuery> = { archived: false },
    ): Promise<number> {
        return this.getAll(query).then((features) => features.length);
    }

    async getAllByNames(names: string[]): Promise<FeatureToggle[]> {
        return this.features.filter((f) => names.includes(f.name));
    }

    async getProjectId(name: string): Promise<string> {
        return this.get(name).then((f) => f.project);
    }

    private getFilterQuery(query: Partial<IFeatureToggleStoreQuery>) {
        return (f) => {
            let projectMatch = true;
            if ('project' in query) {
                projectMatch = f.project === query.project;
            }
            let archiveMatch = true;
            if ('archived' in query) {
                archiveMatch = (f.archived ?? false) === query.archived;
            }
            let staleMatch = true;
            if ('stale' in query) {
                staleMatch = (f.stale ?? false) === query.stale;
            }
            return projectMatch && archiveMatch && staleMatch;
        };
    }

    async create(
        project: string,
        data: FeatureToggleInsert,
    ): Promise<FeatureToggle> {
        const inserted: FeatureToggle = { ...data, project };
        this.features.push(inserted);
        return inserted;
    }

    async delete(key: string): Promise<void> {
        this.features.splice(
            this.features.findIndex((f) => f.name === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.features = [];
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.features.some((f) => f.name === key);
    }

    async get(key: string): Promise<FeatureToggle> {
        const feature = this.features.find((f) => f.name === key);
        if (feature) {
            return feature;
        }
        throw new NotFoundError(`Could not find feature with name ${key}`);
    }

    async getAll(
        query: Partial<IFeatureToggleStoreQuery> = { archived: false },
    ): Promise<FeatureToggle[]> {
        return this.features.filter(this.getFilterQuery(query));
    }

    async getFeatureMetadata(name: string): Promise<FeatureToggle> {
        return this.get(name);
    }

    async getBy(
        query: Partial<IFeatureToggleStoreQuery>,
    ): Promise<FeatureToggle[]> {
        return this.features.filter(this.getFilterQuery(query));
    }

    async revive(featureName: string): Promise<FeatureToggle> {
        const revive = this.features.find((f) => f.name === featureName);
        if (revive) {
            revive.archived = false;
        }
        return this.update(revive.project, revive);
    }

    async getFeatureToggleList(
        query?: IFeatureToggleQuery,
        userId?: number,
        archived = false,
    ): Promise<FeatureToggle[]> {
        return this.features.filter((feature) => feature.archived !== archived);
    }

    async getArchivedFeatures(project: string): Promise<FeatureToggle[]> {
        return this.features.filter((feature) => feature.archived === true);
    }

    async getPlaygroundFeatures(
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        return this.features.filter(
            (feature) => feature,
        ) as FeatureConfigurationClient[];
    }

    async update(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle> {
        const exists = await this.exists(data.name);
        if (exists) {
            const id = this.features.findIndex((f) => f.name === data.name);
            const old = this.features.find((f) => f.name === data.name);
            const updated = { ...old, ...data };
            this.features.splice(id, 1);
            this.features.push(updated);
            return updated;
        }
        throw new NotFoundError('Could not find feature to update');
    }

    async setLastSeen(data: LastSeenInput[]): Promise<void> {
        const envArrays = data.reduce(
            (acc: EnvironmentFeatureNames, feature: LastSeenInput) => {
                const { environment, featureName } = feature;

                if (!acc[environment]) {
                    acc[environment] = [];
                }

                acc[environment].push(featureName);

                return acc;
            },
            {},
        );

        for (const env of Object.keys(envArrays)) {
            const toggleNames = envArrays[env];
            if (toggleNames && Array.isArray(toggleNames)) {
                toggleNames.forEach((t) => {
                    const toUpdate = this.features.find((f) => f.name === t);
                    if (toUpdate) {
                        toUpdate.lastSeenAt = new Date();
                    }
                });
            }
        }
    }

    async getVariants(featureName: string): Promise<IVariant[]> {
        const feature = await this.get(featureName);
        return feature.variants as IVariant[];
    }

    async getAllVariants(): Promise<IFeatureEnvironment[]> {
        const features = await this.getAll();
        const variants = features.flatMap((feature) => ({
            featureName: feature.name,
            environment: 'development',
            variants: feature.variants,
            enabled: true,
        }));
        return Promise.resolve(variants);
    }

    getVariantsForEnv(
        featureName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        environment_name: string,
    ): Promise<IVariant[]> {
        return this.getVariants(featureName);
    }

    async saveVariants(
        project: string,
        featureName: string,
        newVariants: IVariant[],
    ): Promise<FeatureToggle> {
        const feature = await this.get(featureName);
        feature.variants = newVariants;
        return feature;
    }

    async saveVariantsOnEnv(
        featureName: string,
        environment: string,
        newVariants: IVariant[],
    ): Promise<IVariant[]> {
        await this.saveVariants('default', featureName, newVariants);
        return Promise.resolve(newVariants);
    }

    async countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number> {
        return this.features.filter((feature) => {
            if (feature.archived === queryModifiers.archived) {
                return true;
            }

            if (feature.project === queryModifiers.project) {
                return true;
            }

            if (
                new Date(feature[queryModifiers.dateAccessor]).getTime() >=
                new Date(queryModifiers.date).getTime()
            ) {
                return true;
            }

            const featureDate = new Date(
                feature[queryModifiers.dateAccessor],
            ).getTime();
            if (
                featureDate >= new Date(queryModifiers.range[0]).getTime() &&
                featureDate <= new Date(queryModifiers.range[1]).getTime()
            ) {
                return true;
            }
        }).length;
    }

    dropAllVariants(): Promise<void> {
        this.features.forEach((feature) => {
            feature.variants = [];
        });
        return Promise.resolve();
    }

    updatePotentiallyStaleFeatures(): Promise<
        { name: string; potentiallyStale: boolean; project: string }[]
    > {
        throw new Error('Method not implemented.');
    }

    isPotentiallyStale(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getFeatureTypeCounts(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureTypeCount[]> {
        const typeCounts = this.features.reduce(
            (acc, feature) => {
                if (!feature.type) {
                    return acc;
                }

                if (!acc[feature.type]) {
                    acc[feature.type] = { type: feature.type, count: 0 };
                }
                acc[feature.type].count += 1;

                return acc;
            },
            {} as Record<string, IFeatureTypeCount>,
        );

        return Object.values(typeCounts);
    }

    setCreatedByUserId(batchSize: number): Promise<number | undefined> {
        throw new Error('Method not implemented.');
    }
}
