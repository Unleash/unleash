import type {
    Collaborator,
    IFeatureCollaboratorsReadModel,
} from './types/feature-collaborators-read-model-type.js';

export class FakeFeatureCollaboratorsReadModel
    implements IFeatureCollaboratorsReadModel
{
    async getFeatureCollaborators(
        _feature: string,
    ): Promise<Array<Collaborator>> {
        return [];
    }
}
