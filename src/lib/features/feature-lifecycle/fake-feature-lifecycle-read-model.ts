import type { IFeatureLifecycleReadModel } from './feature-lifecycle-read-model-type';
import type { IFeatureLifecycleStage } from '../../types';

export class FakeFeatureLifecycleReadModel
    implements IFeatureLifecycleReadModel
{
    findCurrentStage(
        feature: string,
    ): Promise<IFeatureLifecycleStage | undefined> {
        return Promise.resolve(undefined);
    }
}
