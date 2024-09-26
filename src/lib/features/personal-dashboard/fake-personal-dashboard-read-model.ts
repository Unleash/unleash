import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
    PersonalProject,
} from './personal-dashboard-read-model-type';

export class FakePersonalDashboardReadModel
    implements IPersonalDashboardReadModel
{
    enrichProjectIds(
        userId: number,
        projectIds: string[],
    ): Promise<PersonalProject[]> {
        throw new Error('Method not implemented.');
    }
    async getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return [];
    }

    async getPersonalProjects(userId: number): Promise<PersonalProject[]> {
        return [];
    }
}
