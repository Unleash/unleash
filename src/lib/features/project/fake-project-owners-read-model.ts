import type {
    IProjectOwnersReadModel,
    UserProjectOwner,
    WithProjectOwners,
} from './project-owners-read-model.type';

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

    async getUserProjectOwners(projectId: string): Promise<UserProjectOwner[]> {
        return [];
    }
}
