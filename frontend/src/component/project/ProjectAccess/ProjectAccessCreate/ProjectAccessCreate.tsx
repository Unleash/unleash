import { ProjectAccessAssign } from '../ProjectAccessAssign/ProjectAccessAssign.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectAccess from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { useAccess } from 'hooks/api/getters/useAccess/useAccess';
import { useUserProjectRoles } from '../../../../hooks/api/getters/useUserProjectRoles/useUserProjectRoles.ts';

export const ProjectAccessCreate = () => {
    const projectId = useRequiredPathParam('projectId');

    const { roles: userRoles } = useUserProjectRoles(projectId);
    const { access } = useProjectAccess(projectId);
    const { users, serviceAccounts, groups } = useAccess();

    if (!access || !users || !serviceAccounts || !groups) {
        return null;
    }

    return (
        <ProjectAccessAssign
            accesses={access.rows}
            users={users}
            serviceAccounts={serviceAccounts}
            groups={groups}
            roles={access.roles}
            userRoles={userRoles}
        />
    );
};
