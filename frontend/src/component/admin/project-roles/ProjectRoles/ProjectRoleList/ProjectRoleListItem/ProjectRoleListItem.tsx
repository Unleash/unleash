import { useStyles } from './ProjectRoleListItem.styles';
import { TableCell, TableRow, Typography } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { ADMIN } from '../../../../../providers/AccessProvider/permissions';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import PermissionIconButton from '../../../../../common/PermissionIconButton/PermissionIconButton';
import { IProjectRole } from '../../../../../../interfaces/role';
import { useHistory } from 'react-router-dom';
import React from 'react';

interface IRoleListItemProps {
    id: number;
    name: string;
    type: string;
    description: string;
    setCurrentRole: React.Dispatch<React.SetStateAction<IProjectRole>>;
    setDelDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const BUILTIN_ROLE_TYPE = 'project';

const RoleListItem = ({
    id,
    name,
    type,
    description,
    setCurrentRole,
    setDelDialog,
}: IRoleListItemProps) => {
    const history = useHistory();
    const styles = useStyles();

    return (
        <>
            <TableRow className={styles.tableRow}>
                <TableCell>
                    <SupervisedUserCircleIcon className={styles.icon} />
                </TableCell>
                <TableCell className={styles.leftTableCell}>
                    <Typography variant="body2" data-loading>
                        {name}
                    </Typography>
                </TableCell>
                <TableCell className={styles.leftTableCell}>
                    <Typography variant="body2" data-loading>
                        {description}
                    </Typography>
                </TableCell>

                <TableCell align="right">
                    <PermissionIconButton
                        data-loading
                        aria-label="Edit"
                        // @ts-expect-error
                        disabled={type === BUILTIN_ROLE_TYPE}
                        onClick={() => {
                            history.push(`/admin/roles/${id}/edit`);
                        }}
                        permission={ADMIN}
                    >
                        <Edit />
                    </PermissionIconButton>
                    <PermissionIconButton
                        data-loading
                        aria-label="Remove role"
                        // @ts-expect-error
                        disabled={type === BUILTIN_ROLE_TYPE}
                        onClick={() => {
                            // @ts-expect-error
                            setCurrentRole({ id, name, description });
                            setDelDialog(true);
                        }}
                        permission={ADMIN}
                    >
                        <Delete />
                    </PermissionIconButton>
                </TableCell>
            </TableRow>
        </>
    );
};

export default RoleListItem;
