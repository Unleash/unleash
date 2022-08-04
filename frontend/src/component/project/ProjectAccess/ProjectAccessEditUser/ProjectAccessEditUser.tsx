import { ProjectAccessAssign } from '../ProjectAccessAssign/ProjectAccessAssign';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjectAccess, {
    ENTITY_TYPE,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import { useAccess } from 'hooks/api/getters/useAccess/useAccess';

export const ProjectAccessEditUser = () => {
    const projectId = useRequiredPathParam('projectId');
    const userId = useRequiredPathParam('userId');

    const { access } = useProjectAccess(projectId);
    const { users, groups } = useAccess();

    if (!access || !users || !groups) {
        return null;
    }

    const user = access.rows.find(
        row => row.entity.id === Number(userId) && row.type === ENTITY_TYPE.USER
    );

    return (
        <ProjectAccessAssign
            accesses={access.rows}
            selected={user}
            users={users}
            groups={groups}
            roles={access.roles}
        />
    );
};
