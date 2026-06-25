import type { UserProjectOwner } from './project-owners-read-model.type.js';

export type ProjectMember = Omit<UserProjectOwner, 'ownerType'>;

export interface IProjectMembersReadModel {
    getMembersPreviewByProject(): Promise<Record<string, ProjectMember[]>>;
}
