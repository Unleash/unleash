import type {
    IFeatureLifecycleReadModel,
    StageCount,
    StageCountByProject,
} from './feature-lifecycle-read-model-type';
import type { IFeatureLifecycleStage } from '../../types';

export class FakeFeatureLifecycleReadModel
    implements IFeatureLifecycleReadModel
{
    getStageCount(): Promise<StageCount[]> {
        return Promise.resolve([]);
    }
    getStageCountByProject(): Promise<StageCountByProject[]> {
        return Promise.resolve([]);
    }
    findCurrentStage(
        feature: string,
    ): Promise<IFeatureLifecycleStage | undefined> {
        return Promise.resolve(undefined);
    }
}
