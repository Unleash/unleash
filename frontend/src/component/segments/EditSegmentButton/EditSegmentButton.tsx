import { ISegment } from 'interfaces/segment';
import { Edit } from '@mui/icons-material';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';

interface IEditSegmentButtonProps {
    segment: ISegment;
}

export const EditSegmentButton = ({ segment }: IEditSegmentButtonProps) => {
    const navigate = useNavigate();

    return (
        <PermissionIconButton
            onClick={() => navigate(`/segments/edit/${segment.id}`)}
            permission={UPDATE_SEGMENT}
            tooltipProps={{ title: 'Edit segment' }}
        >
            <Edit data-loading />
        </PermissionIconButton>
    );
};
