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

export type FeatureStageView = { stage: StageName; enteredStageAt: Date };

export type LifecycleView = FeatureStageView[];

export interface IFeatureLifecycleStore {
    insert(featureLifecycleStage: FeatureLifecycleStage): Promise<void>;
    get(feature: string): Promise<LifecycleView>;
}
