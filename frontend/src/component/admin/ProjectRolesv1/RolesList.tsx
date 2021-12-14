import { useContext } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@material-ui/core';
import AccessContext from '../../../contexts/AccessContext';
import usePagination from '../../../hooks/usePagination';
import { ADMIN } from '../../providers/AccessProvider/permissions';
import PaginateUI from '../../common/PaginateUI/PaginateUI';
import RoleListItem from './RolesListItem/RoleListItem';
import useProjectRoles from '../../../hooks/api/getters/useProjectRoles/useProjectRoles';

const RolesList = () => {
    const { hasAccess } = useContext(AccessContext);
    const { roles } = useProjectRoles();
    const { page, pages, nextPage, prevPage, setPageIndex, pageIndex } =
        usePagination(roles, 10);

    const renderRoles = () => {
        return page.map(role => {
            return (
                <RoleListItem
                    key={role.id}
                    name={role.name}
                    description={role.description}
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
                        <TableCell></TableCell>
                        <TableCell>Project Role</TableCell>
                        <TableCell>Description</TableCell>
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
        </div>
    );
};

export default RolesList;
