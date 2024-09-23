import type { IPersonalDashboardReadModel } from './personal-dashboard-read-model-type';

export class FakePersonalDashboardReadModel
    implements IPersonalDashboardReadModel
{
    async getPersonalFeatures(userId: number): Promise<{ name: string }[]> {
        return [];
    }
}
