export type StageName =
    | 'initial'
    | 'pre-live'
    | 'live'
    | 'completed'
    | 'archived';

export type FeatureLifecycleStage = {
    feature: string;
    stage: StageName;
};

export type FeatureLifecycleStageView = {
    stage: StageName;
    enteredStageAt: Date;
};

export type FeatureLifecycleView = FeatureLifecycleStageView[];

export interface IFeatureLifecycleStore {
    insert(featureLifecycleStage: FeatureLifecycleStage): Promise<void>;
    get(feature: string): Promise<FeatureLifecycleView>;
}
