import {
    IFeatureToggleQuery,
    IFeatureToggleStore,
} from '../../lib/types/stores/feature-toggle-store';
import NotFoundError from '../../lib/error/notfound-error';
import { FeatureSchema } from 'lib/openapi/spec/feature-schema';
import { UpdateFeatureSchema } from '../../lib/openapi/spec/updateFeatureSchema';
import { VariantSchema } from '../../lib/openapi/spec/variant-schema';

export default class FakeFeatureToggleStore implements IFeatureToggleStore {
    features: FeatureSchema[] = [];

    async archive(featureName: string): Promise<FeatureSchema> {
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

    async create(project: string, data: FeatureSchema): Promise<FeatureSchema> {
        const inserted: FeatureSchema = { ...data, project };
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

    async get(key: string): Promise<FeatureSchema> {
        const feature = this.features.find((f) => f.name === key);
        if (feature) {
            return feature;
        }
        throw new NotFoundError(`Could not find feature with name ${key}`);
    }

    async getAll(): Promise<FeatureSchema[]> {
        return this.features.filter((f) => !f.archived);
    }

    async getFeatureMetadata(name: string): Promise<FeatureSchema> {
        return this.get(name);
    }

    async getBy(query: Partial<IFeatureToggleQuery>): Promise<FeatureSchema[]> {
        return this.features.filter(this.getFilterQuery(query));
    }

    async revive(featureName: string): Promise<FeatureSchema> {
        const revive = this.features.find((f) => f.name === featureName);
        if (revive) {
            revive.archived = false;
        }
        return this.update(revive.project, revive);
    }

    async update(
        project: string,
        data: UpdateFeatureSchema,
    ): Promise<FeatureSchema> {
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

    async getVariants(featureName: string): Promise<VariantSchema[]> {
        const feature = await this.get(featureName);
        return feature.variants as VariantSchema[];
    }

    async saveVariants(
        project: string,
        featureName: string,
        newVariants: VariantSchema[],
    ): Promise<FeatureSchema> {
        const feature = await this.get(featureName);
        feature.variants = newVariants;
        return feature;
    }
}
