import { useContext, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import AccessContext from 'contexts/AccessContext';
import usePagination from 'hooks/usePagination';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import PaginateUI from 'component/common/PaginateUI/PaginateUI';
import ProjectRoleListItem from './ProjectRoleListItem/ProjectRoleListItem';
import useProjectRoles from 'hooks/api/getters/useProjectRoles/useProjectRoles';
import IRole, { IProjectRole } from 'interfaces/role';
import useProjectRolesApi from 'hooks/api/actions/useProjectRolesApi/useProjectRolesApi';
import useToast from 'hooks/useToast';
import ProjectRoleDeleteConfirm from '../ProjectRoleDeleteConfirm/ProjectRoleDeleteConfirm';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useStyles } from './ProjectRoleListItem/ProjectRoleListItem.styles';

const ROOTROLE = 'root';

const ProjectRoleList = () => {
    const { hasAccess } = useContext(AccessContext);
    const { roles } = useProjectRoles();
    const styles = useStyles();

    const paginationFilter = (role: IRole) => role?.type !== ROOTROLE;

    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(roles, 10, paginationFilter);
    const { deleteRole } = useProjectRolesApi();
    const { refetch } = useProjectRoles();
    const [currentRole, setCurrentRole] = useState<IProjectRole | null>(null);
    const [delDialog, setDelDialog] = useState(false);
    const [confirmName, setConfirmName] = useState('');
    const { setToastData, setToastApiError } = useToast();

    const deleteProjectRole = async () => {
        if (!currentRole?.id) return;
        try {
            await deleteRole(currentRole?.id);
            refetch();
            setToastData({
                type: 'success',
                title: 'Successfully deleted role',
                text: 'Your role is now deleted',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
        setDelDialog(false);
        setConfirmName('');
    };

    const renderRoles = () => {
        return page.map((role: IProjectRole) => {
            return (
                <ProjectRoleListItem
                    key={role.id}
                    id={role.id}
                    name={role.name}
                    type={role.type}
                    description={role.description}
                    // @ts-expect-error
                    setCurrentRole={setCurrentRole}
                    setDelDialog={setDelDialog}
                />
            );
        });
    };

    if (!roles) return null;

    return (
        <div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className={styles.hideXS}></TableCell>
                        <TableCell>Project Role</TableCell>
                        <TableCell className={styles.hideSM}>
                            Description
                        </TableCell>
                        <TableCell align="right">
                            {hasAccess(ADMIN) ? 'Action' : ''}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{renderRoles()}</TableBody>
                <PaginateUI
                    pages={pages}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    nextPage={nextPage}
                    prevPage={prevPage}
                />
            </Table>
            <br />
            <ProjectRoleDeleteConfirm
                // @ts-expect-error
                role={currentRole}
                open={delDialog}
                setDeldialogue={setDelDialog}
                handleDeleteRole={deleteProjectRole}
                confirmName={confirmName}
                setConfirmName={setConfirmName}
            />
        </div>
    );
};

export default ProjectRoleList;
