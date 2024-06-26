import type { ILargestResourcesReadModel } from './largest-resources-read-model-type';

export class FakeLargestResourcesReadModel
    implements ILargestResourcesReadModel
{
    async getLargestProjectEnvironments(
        limit: number,
    ): Promise<{ project: string; environment: string; size: number }[]> {
        return [];
    }
    async getLargestFeatureEnvironments(
        limit: number,
    ): Promise<{ feature: string; environment: string; size: number }[]> {
        return [];
    }
}
