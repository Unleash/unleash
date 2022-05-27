import { CREATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { NAVIGATE_TO_CREATE_SEGMENT } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';

export const CreateSegmentButton = () => {
    const navigate = useNavigate();

    return (
        <PermissionButton
            onClick={() => navigate('/segments/create')}
            permission={CREATE_SEGMENT}
            data-testid={NAVIGATE_TO_CREATE_SEGMENT}
        >
            New segment
        </PermissionButton>
    );
};
