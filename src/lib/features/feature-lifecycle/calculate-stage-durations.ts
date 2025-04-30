import type {
    IProjectLifecycleStageDuration,
    StageName,
} from '../../types/index.js';
import type { FeatureLifecycleProjectItem } from './feature-lifecycle-store-type.js';
import { differenceInMinutes } from 'date-fns';
import { median } from '../../util/median.js';

export function calculateStageDurations(
    featureLifeCycles: FeatureLifecycleProjectItem[],
) {
    const sortedLifeCycles = featureLifeCycles.sort(
        (a, b) => a.enteredStageAt.getTime() - b.enteredStageAt.getTime(),
    );

    const groupedByProjectAndStage = sortedLifeCycles.reduce<{
        [key: string]: number[];
    }>((acc, curr, index, array) => {
        const key = `${curr.project}/${curr.stage}`;
        if (!acc[key]) {
            acc[key] = [];
        }

        const nextItem = array
            .slice(index + 1)
            .find(
                (item) =>
                    item.feature === curr.feature && item.stage !== curr.stage,
            );
        const endTime = nextItem ? nextItem.enteredStageAt : new Date();
        const duration = differenceInMinutes(endTime, curr.enteredStageAt);
        acc[key].push(duration);
        return acc;
    }, {});

    return calculateMedians(groupedByProjectAndStage);
}

export const calculateMedians = (groupedByProjectAndStage: {
    [key: string]: number[];
}) => {
    const medians: IProjectLifecycleStageDuration[] = [];
    Object.entries(groupedByProjectAndStage).forEach(([key, durations]) => {
        const [project, stage] = key.split('/');
        const duration = median(durations);
        medians.push({
            project,
            stage: stage as StageName,
            duration,
        });
    });
    return medians;
};
