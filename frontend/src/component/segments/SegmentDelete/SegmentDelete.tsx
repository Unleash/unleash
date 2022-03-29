import ConditionallyRender from 'component/common/ConditionallyRender';
import { useStrategiesBySegment } from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import { ISegment } from 'interfaces/segment';
import React from 'react';
import { SegmentDeleteConfirm } from './SegmentDeleteConfirm/SegmentDeleteConfirm';
import { SegmentDeleteUsedSegment } from './SegmentDeleteUsedSegment/SegmentDeleteUsedSegment';

interface ISegmentDeleteProps {
    segment: ISegment;
    open: boolean;
    setDeldialogue: React.Dispatch<React.SetStateAction<boolean>>;
    handleDeleteSegment: (id: number) => Promise<void>;
}
export const SegmentDelete = ({
    segment,
    open,
    setDeldialogue,
    handleDeleteSegment,
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
                    setDeldialogue={setDeldialogue}
                    handleDeleteSegment={handleDeleteSegment}
                />
            }
            elseShow={
                <SegmentDeleteUsedSegment
                    segment={segment}
                    open={open}
                    setDeldialogue={setDeldialogue}
                    strategies={strategies}
                />
            }
        />
    );
};
