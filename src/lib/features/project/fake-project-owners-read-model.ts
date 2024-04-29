import type { IProjectWithCount } from '../../types';
import type {
    IProjectOwnersReadModel,
    IProjectWithCountAndOwners,
} from './project-owners-read-model.type';

export class FakeProjectOwnersReadModel implements IProjectOwnersReadModel {
    async addOwners(
        projects: IProjectWithCount[],
    ): Promise<IProjectWithCountAndOwners[]> {
        return projects.map((project) => ({
            ...project,
            owners: [{ ownerType: 'system' }],
        }));
    }
}
