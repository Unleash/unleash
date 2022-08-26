import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStrategiesBySegment } from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import { ISegment } from 'interfaces/segment';
import React from 'react';
import { SegmentDeleteConfirm } from './SegmentDeleteConfirm/SegmentDeleteConfirm';
import { SegmentDeleteUsedSegment } from './SegmentDeleteUsedSegment/SegmentDeleteUsedSegment';

interface ISegmentDeleteProps {
    segment: ISegment;
    open: boolean;
    onClose: () => void;
    onRemove: () => void;
}
export const SegmentDelete = ({
    segment,
    open,
    onClose,
    onRemove,
}: ISegmentDeleteProps) => {
    const { strategies } = useStrategiesBySegment(segment.id);
    const canDeleteSegment = strategies?.length === 0;
    return (
        <ConditionallyRender
            condition={canDeleteSegment}
            show={
                <SegmentDeleteConfirm
                    segment={segment}
                    open={open}
                    onClose={onClose}
                    onRemove={onRemove}
                />
            }
            elseShow={
                <SegmentDeleteUsedSegment
                    segment={segment}
                    open={open}
                    onClose={onClose}
                    strategies={strategies}
                />
            }
        />
    );
};
