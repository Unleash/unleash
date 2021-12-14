import { useStyles } from './RoleListItem.styles';
import { TableRow, TableCell, Typography } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import { ADMIN } from '../../../providers/AccessProvider/permissions';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import PermissionIconButton from '../../../common/PermissionIconButton/PermissionIconButton';

interface IRoleListItemProps {
    key: number;
    name: string;
    description: string;
}

const RoleListItem = ({ key, name, description }: IRoleListItemProps) => {
    const styles = useStyles();

    return (
        <TableRow key={key} className={styles.tableRow}>
            <TableCell>
                <SupervisedUserCircleIcon />
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
                    onClick={() => {
                        console.log('hi');
                    }}
                    permission={ADMIN}
                >
                    <Edit />
                </PermissionIconButton>
                <PermissionIconButton
                    data-loading
                    aria-label="Remove user"
                    tooltip="Remove role"
                    onClick={() => {
                        console.log('hi');
                    }}
                    permission={ADMIN}
                >
                    <Delete />
                </PermissionIconButton>
            </TableCell>
        </TableRow>
    );
};

export default RoleListItem;
