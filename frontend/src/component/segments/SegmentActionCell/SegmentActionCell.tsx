import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { ISegment } from 'interfaces/segment';
import { RemoveSegmentButton } from 'component/segments/RemoveSegmentButton/RemoveSegmentButton';
import { EditSegmentButton } from 'component/segments/EditSegmentButton/EditSegmentButton';

interface ISegmentActionCellProps {
    segment: ISegment;
}

export const SegmentActionCell = ({ segment }: ISegmentActionCellProps) => {
    return (
        <ActionCell>
            <EditSegmentButton segment={segment} />
            <RemoveSegmentButton segment={segment} />
        </ActionCell>
    );
};
