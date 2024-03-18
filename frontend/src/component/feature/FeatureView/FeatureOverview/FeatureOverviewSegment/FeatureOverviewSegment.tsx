import { Fragment } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
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
                    <ConditionallyRender
                        condition={index > 0}
                        show={<StrategySeparator text='AND' />}
                    />
                    <SegmentItem segment={segment} disabled={disabled} />
                </Fragment>
            ))}
        </>
    );
};
