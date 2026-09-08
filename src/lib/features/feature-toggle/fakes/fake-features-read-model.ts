import type { IFeaturesReadModel } from '../types/features-read-model-type.js';

export class FakeFeaturesReadModel implements IFeaturesReadModel {
    private existsValue: boolean;
    private existsInProjectValue: boolean;
    private inProjectValue: boolean;

    constructor({
        featureExists = false,
        featureExistsInProject = true,
        featuresInProject = true,
    }: {
        featureExists?: boolean;
        featureExistsInProject?: boolean;
        featuresInProject?: boolean;
    } = {}) {
        this.existsValue = featureExists;
        this.existsInProjectValue = featureExistsInProject;
        this.inProjectValue = featuresInProject;
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

    featuresInProject(
        _featureA: string,
        _featureB: string,
        _projectId: string,
    ): Promise<boolean> {
        return Promise.resolve(this.inProjectValue);
    }
}
