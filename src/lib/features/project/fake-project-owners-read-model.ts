import type {
    IProjectOwnersReadModel,
    ProjectOwners,
    UserProjectOwner,
    WithProjectOwners,
} from './project-owners-read-model.type.js';

export class FakeProjectOwnersReadModel implements IProjectOwnersReadModel {
    async addOwners<T extends { id: string }>(
        projects: T[],
    ): Promise<WithProjectOwners<T>> {
        return projects.map((project) => ({
            ...project,
            owners: [{ ownerType: 'system' }],
        }));
    }

    async getAllUserProjectOwners(): Promise<UserProjectOwner[]> {
        return [];
    }

    async getProjectOwners(): Promise<ProjectOwners> {
        return [];
    }
}
