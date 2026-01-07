import { ProjectAccessAssign } from '../ProjectAccessAssign/ProjectAccessAssign.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectAccess, {
    ENTITY_TYPE,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { useAccess } from 'hooks/api/getters/useAccess/useAccess';
import { useUserProjectRoles } from '../../../../hooks/api/getters/useUserProjectRoles/useUserProjectRoles.ts';

export const ProjectAccessEditUser = () => {
    const projectId = useRequiredPathParam('projectId');
    const userId = useRequiredPathParam('userId');
    const { roles: userRoles } = useUserProjectRoles(projectId);
    const { access } = useProjectAccess(projectId);
    const { users, serviceAccounts, groups } = useAccess();

    if (!access || !users || !serviceAccounts || !groups) {
        return null;
    }

    const user = access.rows.find(
        (row) =>
            row.entity.id === Number(userId) && row.type !== ENTITY_TYPE.GROUP,
    );

    return (
        <ProjectAccessAssign
            accesses={access.rows}
            selected={user}
            users={users}
            serviceAccounts={serviceAccounts}
            groups={groups}
            roles={access.roles}
            userRoles={userRoles}
        />
    );
};
