import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStrategiesBySegment } from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import type { ISegment } from 'interfaces/segment';
import { SegmentDeleteConfirm } from './SegmentDeleteConfirm/SegmentDeleteConfirm.tsx';
import { SegmentDeleteUsedSegment } from './SegmentDeleteUsedSegment/SegmentDeleteUsedSegment.tsx';

interface ISegmentDeleteProps {
    segment: ISegment;
    open: boolean;
    onClose: () => void;
    onRemove: () => void;
    title: string;
}

export const SegmentDelete = ({
    segment,
    open,
    onClose,
    onRemove,
    title,
}: ISegmentDeleteProps) => {
    const { strategies, changeRequestStrategies, loading } =
        useStrategiesBySegment(segment.id);
    const canDeleteSegment =
        strategies?.length === 0 && changeRequestStrategies?.length === 0;
    if (loading) {
        return null;
    }

    return (
        <ConditionallyRender
            condition={canDeleteSegment}
            show={
                <SegmentDeleteConfirm
                    segment={segment}
                    open={open}
                    onClose={onClose}
                    onRemove={onRemove}
                    title={title}
                />
            }
            elseShow={
                <SegmentDeleteUsedSegment
                    segment={segment}
                    open={open}
                    onClose={onClose}
                    strategies={strategies}
                    changeRequestStrategies={changeRequestStrategies}
                />
            }
        />
    );
};
