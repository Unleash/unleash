import {
    IFeatureToggleQuery,
    IFeatureToggleStore,
    IHasFeature,
} from '../../lib/types/stores/feature-toggle-store';
import { FeatureToggle, FeatureToggleDTO } from '../../lib/types/model';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeFeatureToggleStore implements IFeatureToggleStore {
    features: FeatureToggle[] = [];

    async archiveFeature(featureName: string): Promise<FeatureToggle> {
        const feature = this.features.find((f) => f.name === featureName);
        if (feature) {
            feature.archived = true;
            return feature;
        }
        throw new NotFoundError(
            `Could not find feature toggle with name ${featureName}`,
        );
    }

    async count(query: Partial<IFeatureToggleQuery>): Promise<number> {
        return this.features.filter(this.getFilterQuery(query)).length;
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

    async createFeature(
        project: string,
        data: FeatureToggleDTO,
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

    async getAll(): Promise<FeatureToggle[]> {
        return this.features.filter((f) => !f.archived);
    }

    async getFeatureMetadata(name: string): Promise<FeatureToggle> {
        return this.get(name);
    }

    async getFeatures(archived: boolean): Promise<FeatureToggle[]> {
        return this.features.filter((f) => f.archived === archived);
    }

    async getFeaturesBy(
        query: Partial<IFeatureToggleQuery>,
    ): Promise<FeatureToggle[]> {
        return this.features.filter(this.getFilterQuery(query));
    }

    async hasFeature(featureName: string): Promise<IHasFeature> {
        const { name, archived } = await this.get(featureName);
        return { name, archived };
    }

    async reviveFeature(featureName: string): Promise<FeatureToggle> {
        const revive = this.features.find((f) => f.name === featureName);
        if (revive) {
            revive.archived = false;
        }
        return this.updateFeature(revive.project, revive);
    }

    async updateFeature(
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

    async updateLastSeenForToggles(toggleNames: string[]): Promise<void> {
        toggleNames.forEach((t) => {
            const toUpdate = this.features.find((f) => f.name === t);
            if (toUpdate) {
                toUpdate.lastSeenAt = new Date();
            }
        });
    }
}
