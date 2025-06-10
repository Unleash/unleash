import { Fragment } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import type { ISegment } from 'interfaces/segment';
import { SegmentItem } from 'component/common/SegmentItem/SegmentItem';
import { ConstraintSeparator } from 'component/common/ConstraintsList/ConstraintSeparator/ConstraintSeparator';

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
                        show={<ConstraintSeparator />}
                    />
                    <SegmentItem segment={segment} disabled={disabled} />
                </Fragment>
            ))}
        </>
    );
};
