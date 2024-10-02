import type { IUser } from '../../server-impl';
import type {
    BasePersonalProject,
    IPersonalDashboardReadModel,
    PersonalFeature,
} from './personal-dashboard-read-model-type';

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
