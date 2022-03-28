import {
    Avatar,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from '@material-ui/core';
import { Delete, Edit, Lock } from '@material-ui/icons';
import { SyntheticEvent, useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import ConditionallyRender from 'component/common/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { IUser } from 'interfaces/user';
import { useStyles } from './UserListItem.styles';
import { useHistory } from 'react-router-dom';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';

interface IUserListItemProps {
    user: IUser;
    renderRole: (roleId: number) => string;
    openPwDialog: (user: IUser) => (e: SyntheticEvent) => void;
    openDelDialog: (user: IUser) => (e: SyntheticEvent) => void;
    locationSettings: ILocationSettings;
}

const UserListItem = ({
    user,
    renderRole,
    openDelDialog,
    openPwDialog,
    locationSettings,
}: IUserListItemProps) => {
    const { hasAccess } = useContext(AccessContext);
    const history = useHistory();
    const styles = useStyles();

    return (
        <TableRow key={user.id} className={styles.tableRow}>
            <TableCell className={styles.hideXS}>
                <Avatar
                    data-loading
                    alt={user.name}
                    src={user.imageUrl}
                    title={`${user.name || user.email || user.username} (id: ${
                        user.id
                    })`}
                />
            </TableCell>
            <TableCell className={styles.hideSM}>
                <span data-loading>
                    {formatDateYMD(user.createdAt, locationSettings.locale)}
                </span>
            </TableCell>
            <TableCell className={styles.leftTableCell}>
                <Typography variant="body2" data-loading>
                    {user.name}
                </Typography>
            </TableCell>
            <TableCell className={`${styles.leftTableCell} ${styles.hideSM}`}>
                <Typography variant="body2" data-loading>
                    {user.username || user.email}
                </Typography>
            </TableCell>
            <TableCell align="center" className={styles.hideXS}>
                <Typography variant="body2" data-loading>
                    {renderRole(user.rootRole)}
                </Typography>
            </TableCell>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={
                    <TableCell align="right">
                        <IconButton
                            data-loading
                            aria-label="Edit"
                            title="Edit"
                            onClick={() =>
                                history.push(`/admin/users/${user.id}/edit`)
                            }
                        >
                            <Edit />
                        </IconButton>
                        <IconButton
                            data-loading
                            aria-label="Change password"
                            title="Change password"
                            onClick={openPwDialog(user)}
                        >
                            <Lock />
                        </IconButton>
                        <IconButton
                            data-loading
                            aria-label="Remove user"
                            title="Remove user"
                            onClick={openDelDialog(user)}
                        >
                            <Delete />
                        </IconButton>
                    </TableCell>
                }
                elseShow={<TableCell />}
            />
        </TableRow>
    );
};

export default UserListItem;
