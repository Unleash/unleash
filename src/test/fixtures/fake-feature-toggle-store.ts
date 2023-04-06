import {
    IFeatureToggleQuery,
    IFeatureToggleStore,
} from '../../lib/types/stores/feature-toggle-store';
import NotFoundError from '../../lib/error/notfound-error';
import {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureEnvironment,
    IVariant,
} from 'lib/types/model';

export default class FakeFeatureToggleStore implements IFeatureToggleStore {
    features: FeatureToggle[] = [];

    async archive(featureName: string): Promise<FeatureToggle> {
        const feature = this.features.find((f) => f.name === featureName);
        if (feature) {
            feature.archived = true;
            return feature;
        }
        throw new NotFoundError(
            `Could not find feature toggle with name ${featureName}`,
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

    async count(query: Partial<IFeatureToggleQuery>): Promise<number> {
        return this.features.filter(this.getFilterQuery(query)).length;
    }

    async getAllByNames(names: string[]): Promise<FeatureToggle[]> {
        return this.features.filter((f) => names.includes(f.name));
    }

    async getProjectId(name: string): Promise<string> {
        return this.get(name).then((f) => f.project);
    }

    private getFilterQuery(query: Partial<IFeatureToggleQuery>) {
        return (f) => {
            let projectMatch = true;
            if (query.project) {
                projectMatch = f.project === query.project;
            }
            let archiveMatch = true;
            if (query.archived) {
                archiveMatch = f.archived === query.archived;
            }
            let staleMatch = true;
            if (query.stale) {
                staleMatch = f.stale === query.stale;
            }
            return projectMatch && archiveMatch && staleMatch;
        };
    }

    async create(project: string, data: FeatureToggle): Promise<FeatureToggle> {
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

    async getAll(): Promise<FeatureToggle[]> {
        return this.features.filter((f) => !f.archived);
    }

    async getFeatureMetadata(name: string): Promise<FeatureToggle> {
        return this.get(name);
    }

    async getBy(query: Partial<IFeatureToggleQuery>): Promise<FeatureToggle[]> {
        return this.features.filter(this.getFilterQuery(query));
    }

    async revive(featureName: string): Promise<FeatureToggle> {
        const revive = this.features.find((f) => f.name === featureName);
        if (revive) {
            revive.archived = false;
        }
        return this.update(revive.project, revive);
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

    async setLastSeen(toggleNames: string[]): Promise<void> {
        toggleNames.forEach((t) => {
            const toUpdate = this.features.find((f) => f.name === t);
            if (toUpdate) {
                toUpdate.lastSeenAt = new Date();
            }
        });
    }

    async getVariants(featureName: string): Promise<IVariant[]> {
        const feature = await this.get(featureName);
        return feature.variants as IVariant[];
    }

    async getAllVariants(): Promise<IFeatureEnvironment[]> {
        let features = await this.getAll();
        let variants = features.flatMap((feature) => ({
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
        this.features.forEach((feature) => (feature.variants = []));
        return Promise.resolve();
    }
}
