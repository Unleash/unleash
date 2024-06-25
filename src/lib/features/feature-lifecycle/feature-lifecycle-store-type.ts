import type { IFeatureLifecycleStage, StageName } from '../../types';

export type FeatureLifecycleStage = {
    feature: string;
    stage: StageName;
    status?: string;
    statusValue?: string;
};

export type FeatureLifecycleView = IFeatureLifecycleStage[];

export type FeatureLifecycleProjectItem = FeatureLifecycleStage & {
    enteredStageAt: Date;
    project: string;
};

export interface IFeatureLifecycleStore {
    insert(featureLifecycleStages: FeatureLifecycleStage[]): Promise<void>;
    get(feature: string): Promise<FeatureLifecycleView>;
    stageExists(stage: FeatureLifecycleStage): Promise<boolean>;
    delete(feature: string): Promise<void>;
    deleteAll(): Promise<void>;
    deleteStage(stage: FeatureLifecycleStage): Promise<void>;
    backfill(): Promise<void>;
}
