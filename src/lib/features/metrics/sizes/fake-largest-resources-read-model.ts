import type { ILargestResourcesReadModel } from './largest-resources-read-model-type.js';

export class FakeLargestResourcesReadModel
    implements ILargestResourcesReadModel
{
    async getLargestProjectEnvironments(
        _limit: number,
    ): Promise<{ project: string; environment: string; size: number }[]> {
        return [];
    }
    async getLargestFeatureEnvironments(
        _limit: number,
    ): Promise<{ feature: string; environment: string; size: number }[]> {
        return [];
    }
}
