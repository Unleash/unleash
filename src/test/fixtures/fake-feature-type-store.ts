import type {
    IFeatureType,
    IFeatureTypeStore,
} from '../../lib/types/stores/feature-type-store.js';
import NotFoundError from '../../lib/error/notfound-error.js';

export default class FakeFeatureTypeStore implements IFeatureTypeStore {
    featureTypes: IFeatureType[] = [];

    async delete(key: string): Promise<void> {
        this.featureTypes.splice(
            this.featureTypes.findIndex((type) => type.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.featureTypes = [];
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.featureTypes.some((fT) => fT.id === key);
    }

    async get(key: string): Promise<IFeatureType> {
        const type = this.featureTypes.find((fT) => fT.id === key);
        if (type) {
            return type;
        }
        throw new NotFoundError(`Could not find feature type with id : ${key}`);
    }

    async getAll(): Promise<IFeatureType[]> {
        return this.featureTypes;
    }

    async getByName(name: string): Promise<IFeatureType> {
        const type = this.featureTypes.find((fT) => fT.name === name);
        if (type) {
            return type;
        }
        throw new NotFoundError(
            `Could not find feature type with name: ${name}`,
        );
    }

    async updateLifetime(
        name: string,
        newLifetimeDays: number | null,
    ): Promise<IFeatureType | undefined> {
        const featureType = this.featureTypes.find(
            ({ name: type }) => type === name,
        );
        if (!featureType) {
            return undefined;
        }
        featureType.lifetimeDays = newLifetimeDays;
        return featureType;
    }
}
