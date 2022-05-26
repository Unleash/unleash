import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AdminMenu from 'component/admin/menu/AdminMenu';
import ProjectRoleList from './ProjectRoleList/ProjectRoleList';
import { AdminAlert } from 'component/common/AdminAlert/AdminAlert';

const ProjectRoles = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <div>
            <AdminMenu />
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={<ProjectRoleList />}
                elseShow={<AdminAlert />}
            />
        </div>
    );
};

export default ProjectRoles;
