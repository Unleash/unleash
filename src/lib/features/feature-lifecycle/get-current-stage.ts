import type { IFeatureLifecycleStage, StageName } from '../../types/index.js';

const preferredOrder: StageName[] = [
    'archived',
    'completed',
    'live',
    'pre-live',
    'initial',
];

export function getCurrentStage(
    stages: IFeatureLifecycleStage[],
): IFeatureLifecycleStage | undefined {
    for (const preferredStage of preferredOrder) {
        const foundStage = stages.find(
            (stage) => stage.stage === preferredStage,
        );
        if (foundStage) {
            return foundStage;
        }
    }
    return undefined;
}
