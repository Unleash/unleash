import type {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import type { FC } from 'react';
import { EventDiff } from 'component/events/EventDiff/EventDiff';
import omit from 'lodash.omit';
import type { IFeatureStrategy } from 'interfaces/strategy';

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

const omitIfDefined = (obj: any, keys: string[]) =>
    obj ? omit(obj, keys) : obj;

export const StrategyDiff: FC<{
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy;
    currentStrategy?: IFeatureStrategy;
}> = ({ change, currentStrategy }) => {
    const changeRequestStrategy =
        change.action === 'deleteStrategy' ? undefined : change.payload;

    const sortedCurrentStrategy = sortSegments(currentStrategy);
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
