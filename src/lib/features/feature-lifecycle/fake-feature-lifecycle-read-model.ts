import type {
    IFeatureLifecycleReadModel,
    StageCount,
    StageCountByProject,
} from './feature-lifecycle-read-model-type.js';
import type {
    IFeatureLifecycleStage,
    IProjectLifecycleStageDuration,
} from '../../types/index.js';

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
        _feature: string,
    ): Promise<IFeatureLifecycleStage | undefined> {
        return Promise.resolve(undefined);
    }
}
