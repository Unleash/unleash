export type ProjectMember = {
    name: string;
    email?: string;
    imageUrl?: string;
};

export interface IProjectMembersReadModel {
    getMembersPreviewByProject(): Promise<Record<string, ProjectMember[]>>;
}
