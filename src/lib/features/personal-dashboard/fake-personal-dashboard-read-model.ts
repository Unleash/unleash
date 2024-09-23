import type {
    IPersonalDashboardReadModel,
    PersonalFeature,
} from './personal-dashboard-read-model-type';

export class FakePersonalDashboardReadModel
    implements IPersonalDashboardReadModel
{
    async getPersonalFeatures(userId: number): Promise<PersonalFeature[]> {
        return [];
    }
}
