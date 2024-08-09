import { Fragment } from 'react';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { SegmentItem } from '../../../../common/SegmentItem/SegmentItem';
import type { ISegment } from 'interfaces/segment';

interface IFeatureOverviewSegmentProps {
    segments?: ISegment[];
    disabled?: boolean | null;
}

export const FeatureOverviewSegment = ({
    segments,
    disabled = false,
}: IFeatureOverviewSegmentProps) => {
    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <>
            {segments.map((segment, index) => (
                <Fragment key={segment.id}>
                    {index > 0 ? <StrategySeparator text='AND' /> : null}
                    <SegmentItem segment={segment} disabled={disabled} />
                </Fragment>
            ))}
        </>
    );
};
