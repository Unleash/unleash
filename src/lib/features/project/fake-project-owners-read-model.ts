import type {
    IProjectOwnersReadModel,
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
}
