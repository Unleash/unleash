import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStrategiesBySegment } from 'hooks/api/getters/useStrategiesBySegment/useStrategiesBySegment';
import type { ISegment } from 'interfaces/segment';
import { SegmentDeleteConfirm } from './SegmentDeleteConfirm/SegmentDeleteConfirm.tsx';
import { SegmentDeleteUsedSegment } from './SegmentDeleteUsedSegment/SegmentDeleteUsedSegment.tsx';
import type { Tracking } from 'utils/trackingEvents';

interface ISegmentDeleteProps {
    segment: ISegment;
    open: boolean;
    onClose: () => void;
    onRemove: () => void;
    title: string;
    tracking?: Tracking;
}

export const SegmentDelete = ({
    segment,
    open,
    onClose,
    onRemove,
    title,
    tracking,
}: ISegmentDeleteProps) => {
    const { strategies, changeRequestStrategies, loading } =
        useStrategiesBySegment(segment.id);
    const canDeleteSegment =
        strategies?.length === 0 && changeRequestStrategies?.length === 0;

    const brandedTracking = (segmentInUse: boolean) =>
        tracking && {
            ...tracking,
            props: { ...tracking.props, segmentInUse },
        };

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
                    tracking={brandedTracking(false)}
                />
            }
            elseShow={
                <SegmentDeleteUsedSegment
                    tracking={brandedTracking(true)}
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
