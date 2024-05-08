import type { IFeatureLifecycleStage, StageName } from '../../types';

export type FeatureLifecycleStage = {
    feature: string;
    stage: StageName;
};

export type FeatureLifecycleView = IFeatureLifecycleStage[];

export type FeatureLifecycleFullItem = FeatureLifecycleStage & {
    enteredStageAt: Date;
};

export interface IFeatureLifecycleStore {
    insert(featureLifecycleStages: FeatureLifecycleStage[]): Promise<void>;
    get(feature: string): Promise<FeatureLifecycleView>;
    getAll(): Promise<FeatureLifecycleFullItem[]>;
    stageExists(stage: FeatureLifecycleStage): Promise<boolean>;
    delete(feature: string): Promise<void>;
    deleteStage(stage: FeatureLifecycleStage): Promise<void>;
}
