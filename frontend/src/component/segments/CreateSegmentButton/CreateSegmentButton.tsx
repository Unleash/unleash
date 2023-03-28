import {
    CREATE_SEGMENT,
    UPDATE_PROJECT_SEGMENT,
} from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { NAVIGATE_TO_CREATE_SEGMENT } from 'utils/testIds';
import { useNavigate } from 'react-router-dom';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

export const CreateSegmentButton = () => {
    const projectId = useOptionalPathParam('projectId');
    const navigate = useNavigate();

    return (
        <PermissionButton
            onClick={() => {
                if (projectId) {
                    navigate(`/projects/${projectId}/settings/segments/create`);
                } else {
                    navigate('/segments/create');
                }
            }}
            permission={[CREATE_SEGMENT, UPDATE_PROJECT_SEGMENT]}
            projectId={projectId}
            data-testid={NAVIGATE_TO_CREATE_SEGMENT}
        >
            New segment
        </PermissionButton>
    );
};
