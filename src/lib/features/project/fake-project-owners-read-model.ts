import type {
    IProjectOwnersReadModel,
    IProjectForUiWithOwners,
} from './project-owners-read-model.type';
import type { ProjectForUi } from './project-read-model-type';

export class FakeProjectOwnersReadModel implements IProjectOwnersReadModel {
    async addOwners(
        projects: ProjectForUi[],
    ): Promise<IProjectForUiWithOwners[]> {
        return projects.map((project) => ({
            ...project,
            owners: [{ ownerType: 'system' }],
        }));
    }
}
