import type { IFeatureLifecycleStage } from '../../types';

export interface IFeatureLifecycleReadModel {
    findCurrentStage(
        feature: string,
    ): Promise<IFeatureLifecycleStage | undefined>;
}
