import { useStyles } from './ProjectRoleListItem.styles';
import { TableCell, TableRow, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { IProjectRole } from 'interfaces/role';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    return (
        <>
            <TableRow className={styles.tableRow}>
                <TableCell className={styles.hideXS}>
                    <SupervisedUserCircleIcon className={styles.icon} />
                </TableCell>
                <TableCell className={styles.leftTableCell}>
                    <Typography variant="body2" data-loading>
                        {name}
                    </Typography>
                </TableCell>
                <TableCell className={styles.description}>
                    <Typography variant="body2" data-loading>
                        {description}
                    </Typography>
                </TableCell>

                <TableCell align="right">
                    <PermissionIconButton
                        data-loading
                        disabled={type === BUILTIN_ROLE_TYPE}
                        onClick={() => {
                            navigate(`/admin/roles/${id}/edit`);
                        }}
                        permission={ADMIN}
                        tooltipProps={{ title: 'Edit role' }}
                    >
                        <Edit />
                    </PermissionIconButton>
                    <PermissionIconButton
                        data-loading
                        disabled={type === BUILTIN_ROLE_TYPE}
                        onClick={() => {
                            // @ts-expect-error
                            setCurrentRole({ id, name, description });
                            setDelDialog(true);
                        }}
                        permission={ADMIN}
                        tooltipProps={{ title: 'Remove role' }}
                    >
                        <Delete />
                    </PermissionIconButton>
                </TableCell>
            </TableRow>
        </>
    );
};

export default RoleListItem;
