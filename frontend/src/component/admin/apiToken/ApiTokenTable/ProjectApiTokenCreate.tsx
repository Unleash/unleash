import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectAccess from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { useAccess } from 'hooks/api/getters/useAccess/useAccess';
import { GO_BACK } from '../../../../constants/navigate';
import { CreateApiToken } from '../CreateApiToken/CreateApiToken';
import { SidebarModal } from '../../../common/SidebarModal/SidebarModal';
import { useNavigate } from 'react-router-dom';

export const ProjectApiTokenCreate = () => {
    const projectId = useRequiredPathParam('projectId');
    const navigate = useNavigate();

    const { access } = useProjectAccess(projectId);
    const { users, serviceAccounts, groups } = useAccess();

    if (!access || !users || !serviceAccounts || !groups) {
        return null;
    }

    return (
        <SidebarModal
            open
            onClose={() => navigate(GO_BACK)}
            label={`Create API token`}
        >
            <CreateApiToken modal={true} project={projectId} />
        </SidebarModal>
    );
};
