import type { IFeaturesReadModel } from '../types/features-read-model-type.js';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    private existsValue: boolean;
    private existsInProjectValue: boolean;
    private sameProjectValue: boolean;

    constructor({
        featureExists = false,
        featureExistsInProject = true,
        featuresInTheSameProject = true,
    }: {
        featureExists?: boolean;
        featureExistsInProject?: boolean;
        featuresInTheSameProject?: boolean;
    } = {}) {
        this.existsValue = featureExists;
        this.existsInProjectValue = featureExistsInProject;
        this.sameProjectValue = featuresInTheSameProject;
    }

    featureExists(): Promise<boolean> {
        return Promise.resolve(this.existsValue);
    }

    featureExistsInProject(
        _featureName: string,
        _projectId: string,
    ): Promise<boolean> {
        return Promise.resolve(this.existsInProjectValue);
    }

    featuresInTheSameProject(
        _featureA: string,
        _featureB: string,
    ): Promise<boolean> {
        return Promise.resolve(this.sameProjectValue);
    }
}
