import type {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';
import type { FC } from 'react';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import type { IFeatureStrategy } from 'interfaces/strategy';
import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { omitIfDefined } from 'utils/omitFields';

const sortSegments = <T extends { segments?: number[] }>(
    item?: T,
): T | undefined => {
    if (!item || !item.segments) {
        return item;
    }
    return {
        ...item,
        segments: [...item.segments].sort((a, b) => a - b),
    };
};

export const StrategyDiff: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestUpdateMilestoneStrategy
        | IChangeRequestDeleteStrategy;
    currentStrategy?: IFeatureStrategy | IReleasePlanMilestoneStrategy;
}> = ({ change, currentStrategy }) => {
    const changeRequestStrategy =
        change.action === 'deleteStrategy' ? undefined : change.payload;

    const sortedCurrentStrategy =
        change.action === 'updateMilestoneStrategy'
            ? sortSegments(
                  omitIfDefined(currentStrategy, [
                      'strategyName',
                      'milestoneId',
                  ]),
              )
            : sortSegments(currentStrategy);
    const sortedChangeRequestStrategy = sortSegments(changeRequestStrategy);

    return (
        <EventDiff
            entry={{
                preData: omitIfDefined(sortedCurrentStrategy, ['sortOrder']),
                data: omitIfDefined(sortedChangeRequestStrategy, ['snapshot']),
            }}
        />
    );
};
