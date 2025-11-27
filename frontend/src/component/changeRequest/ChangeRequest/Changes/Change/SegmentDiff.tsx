import type {
    IChangeRequestDeleteSegment,
    IChangeRequestUpdateSegment,
} from 'component/changeRequest/changeRequest.types';
import type { FC } from 'react';
import type { ISegment } from 'interfaces/segment';
import { EventDiff } from 'component/events/EventDiff/EventDiff.tsx';
import { omitIfDefined } from 'utils/omitFields';

export const SegmentDiff: FC<{
    change: IChangeRequestUpdateSegment | IChangeRequestDeleteSegment;
    currentSegment?: ISegment;
}> = ({ change, currentSegment }) => {
    const changeRequestSegment =
        change.action === 'deleteSegment' ? undefined : change.payload;

    return (
        <EventDiff
            entry={{
                preData: omitIfDefined(currentSegment, [
                    'createdAt',
                    'createdBy',
                ]),
                data: omitIfDefined(changeRequestSegment, ['snapshot']),
            }}
        />
    );
};
