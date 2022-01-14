import { useStyles } from './ProjectRoleListItem.styles';
import { TableRow, TableCell, Typography } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import { ADMIN } from '../../../../../providers/AccessProvider/permissions';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import PermissionIconButton from '../../../../../common/PermissionIconButton/PermissionIconButton';
import { IProjectRole } from '../../../../../../interfaces/role';
import { useHistory } from 'react-router-dom';

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
                        tooltip="Edit"
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
                        tooltip="Remove role"
                        disabled={type === BUILTIN_ROLE_TYPE}
                        onClick={() => {
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
