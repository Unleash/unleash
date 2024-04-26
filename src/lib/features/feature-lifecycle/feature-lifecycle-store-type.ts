import type { IFeatureLifecycleStage, StageName } from '../../types';

export type FeatureLifecycleStage = {
    feature: string;
    stage: StageName;
};

export type FeatureLifecycleView = IFeatureLifecycleStage[];

export interface IFeatureLifecycleStore {
    insert(featureLifecycleStages: FeatureLifecycleStage[]): Promise<void>;
    get(feature: string): Promise<FeatureLifecycleView>;
    stageExists(stage: FeatureLifecycleStage): Promise<boolean>;
    delete(feature: string): Promise<void>;
}
