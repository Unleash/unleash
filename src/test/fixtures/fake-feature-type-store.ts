import {
    IFeatureType,
    IFeatureTypeStore,
} from '../../lib/types/stores/feature-type-store';
import NotFoundError from '../../lib/error/notfound-error';

export default class FakeFeatureTypeStore implements IFeatureTypeStore {
    featureTypes: IFeatureType[] = [];

    async delete(key: number): Promise<void> {
        this.featureTypes.splice(
            this.featureTypes.findIndex((type) => type.id === key),
            1,
        );
    }

    async deleteAll(): Promise<void> {
        this.featureTypes = [];
    }

    destroy(): void {}

    async exists(key: number): Promise<boolean> {
        return this.featureTypes.some((fT) => fT.id === key);
    }

    async get(key: number): Promise<IFeatureType> {
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
}
