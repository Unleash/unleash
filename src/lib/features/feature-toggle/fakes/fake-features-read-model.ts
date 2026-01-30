import type { IFeaturesReadModel } from '../types/features-read-model-type.js';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    private existsValue: boolean;
    private sameProjectValue: boolean;

    constructor({
        featureExists = false,
        featuresInTheSameProject = true,
    }: {
        featureExists?: boolean;
        featuresInTheSameProject?: boolean;
    } = {}) {
        this.existsValue = featureExists;
        this.sameProjectValue = featuresInTheSameProject;
    }

    featureExists(): Promise<boolean> {
        return Promise.resolve(this.existsValue);
    }

    featuresInTheSameProject(
        _featureA: string,
        _featureB: string,
    ): Promise<boolean> {
        return Promise.resolve(this.sameProjectValue);
    }
}
