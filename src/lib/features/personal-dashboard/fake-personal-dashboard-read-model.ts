import type { IUser } from '../../types/index.js';
import type {
    BasePersonalProject,
    IPersonalDashboardReadModel,
    PersonalFeature,
} from './personal-dashboard-read-model-type.js';

export class FakePersonalDashboardReadModel
    implements IPersonalDashboardReadModel
{
    async getLatestHealthScores(
        project: string,
        count: number,
    ): Promise<number[]> {
        return [];
    }

    async getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return [];
    }

    async getPersonalProjects(userId: number): Promise<BasePersonalProject[]> {
        return [];
    }

    async getAdmins(): Promise<IUser[]> {
        return [];
    }
}
