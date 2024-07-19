export type Collaborator = {
    id: number;
    name: string;
    imageUrl: string;
};

export interface IFeatureCollaboratorsReadModel {
    getFeatureCollaborators(feature: string): Promise<Array<Collaborator>>;
}
