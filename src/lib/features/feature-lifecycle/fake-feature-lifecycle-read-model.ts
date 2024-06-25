import type {
    IFeatureLifecycleReadModel,
    StageCount,
    StageCountByProject,
} from './feature-lifecycle-read-model-type';
import type {
    IFeatureLifecycleStage,
    IProjectLifecycleStageDuration,
} from '../../types';

export class FakeFeatureLifecycleReadModel
    implements IFeatureLifecycleReadModel
{
    getAllWithStageDuration(): Promise<IProjectLifecycleStageDuration[]> {
        return Promise.resolve([]);
    }
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
