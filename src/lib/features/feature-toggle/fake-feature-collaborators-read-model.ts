import type {
    Collaborator,
    IFeatureCollaboratorsReadModel,
} from './types/feature-collaborators-read-model-type';

export class FakeFeatureCollaboratorsReadModel
    implements IFeatureCollaboratorsReadModel
{
    async getFeatureCollaborators(
        feature: string,
    ): Promise<Array<Collaborator>> {
        return [];
    }
}
