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
        _project: string,
        _count: number,
    ): Promise<number[]> {
        return [];
    }

    async getPersonalFeatures(_userId: number): Promise<PersonalFeature[]> {
        return [];
    }

    async getPersonalProjects(_userId: number): Promise<BasePersonalProject[]> {
        return [];
    }

    async getAdmins(): Promise<IUser[]> {
        return [];
    }
}
