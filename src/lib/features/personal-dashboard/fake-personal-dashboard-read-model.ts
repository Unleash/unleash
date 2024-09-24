import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';

export class FakePersonalDashboardReadModel
    implements IPersonalDashboardReadModel
{
    async getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return [];
    }

    async getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        return [];
    }
}
