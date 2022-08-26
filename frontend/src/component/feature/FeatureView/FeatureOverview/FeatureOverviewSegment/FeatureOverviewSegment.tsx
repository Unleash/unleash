import { Fragment } from 'react';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { SegmentItem } from '../../../../common/SegmentItem/SegmentItem';

interface IFeatureOverviewSegmentProps {
    strategyId: string;
}

export const FeatureOverviewSegment = ({
    strategyId,
}: IFeatureOverviewSegmentProps) => {
    const { segments } = useSegments(strategyId);

    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <>
            {segments.map((segment, index) => (
                <Fragment key={segment.id}>
                    <ConditionallyRender
                        condition={index > 0}
                        show={<StrategySeparator text="AND" />}
                    />
                    <SegmentItem segment={segment} />
                </Fragment>
            ))}
        </>
    );
};
