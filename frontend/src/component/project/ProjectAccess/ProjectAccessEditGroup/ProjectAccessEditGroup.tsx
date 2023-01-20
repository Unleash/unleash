import { ProjectAccessAssign } from '../ProjectAccessAssign/ProjectAccessAssign';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectAccess, {
    ENTITY_TYPE,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { useAccess } from 'hooks/api/getters/useAccess/useAccess';

export const ProjectAccessEditGroup = () => {
    const projectId = useRequiredPathParam('projectId');
    const groupId = useRequiredPathParam('groupId');

    const { access } = useProjectAccess(projectId);
    const { users, serviceAccounts, groups } = useAccess();

    if (!access || !users || !serviceAccounts || !groups) {
        return null;
    }

    const group = access.rows.find(
        row =>
            row.entity.id === Number(groupId) && row.type === ENTITY_TYPE.GROUP
    );

    return (
        <ProjectAccessAssign
            accesses={access.rows}
            selected={group}
            users={users}
            serviceAccounts={serviceAccounts}
            groups={groups}
            roles={access.roles}
        />
    );
};
