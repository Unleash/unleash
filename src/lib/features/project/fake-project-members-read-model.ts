import type {
    IProjectMembersReadModel,
    ProjectMember,
} from './project-members-read-model.type.js';

export class FakeProjectMembersReadModel implements IProjectMembersReadModel {
    async getMembersPreviewByProject(): Promise<
        Record<string, ProjectMember[]>
    > {
        return {};
    }
}
