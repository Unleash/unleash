import {
    Avatar,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import classnames from 'classnames';
import { Delete, Edit, Lock, MonetizationOn } from '@mui/icons-material';
import { SyntheticEvent, useContext } from 'react';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { IUser } from 'interfaces/user';
import { useNavigate } from 'react-router-dom';
import { ILocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useStyles } from './UserListItem.styles';
import TimeAgo from 'react-timeago';

interface IUserListItemProps {
    user: IUser;
    renderRole: (roleId: number) => string;
    openPwDialog: (user: IUser) => (e: SyntheticEvent) => void;
    openDelDialog: (user: IUser) => (e: SyntheticEvent) => void;
    locationSettings: ILocationSettings;
    search: string;
    isBillingUsers?: boolean;
}

const UserListItem = ({
    user,
    renderRole,
    openDelDialog,
    openPwDialog,
    locationSettings,
    search,
    isBillingUsers,
}: IUserListItemProps) => {
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    const renderTimeAgo = (date: string) => (
        <Tooltip
            title={`Last login: ${formatDateYMD(
                date,
                locationSettings.locale
            )}`}
            arrow
        >
            <Typography noWrap variant="body2" data-loading>
                <TimeAgo date={new Date(date)} live={false} title={''} />
            </Typography>
        </Tooltip>
    );

    return (
        <TableRow key={user.id} className={styles.tableRow}>
            <ConditionallyRender
                condition={Boolean(isBillingUsers)}
                show={
                    <TableCell align="center" className={styles.hideSM}>
                        <ConditionallyRender
                            condition={Boolean(user.paid)}
                            show={
                                <Tooltip title="Paid user" arrow>
                                    <MonetizationOn
                                        sx={theme => ({
                                            color: theme.palette.primary.light,
                                            fontSize: '1.75rem',
                                        })}
                                    />
                                </Tooltip>
                            }
                            elseShow={<span data-loading>Free</span>}
                        />
                    </TableCell>
                }
            />
            <TableCell className={styles.hideSM}>
                <span data-loading>
                    {formatDateYMD(user.createdAt, locationSettings.locale)}
                </span>
            </TableCell>
            <TableCell align="center" className={styles.hideXS}>
                <Avatar
                    data-loading
                    alt="Gravatar"
                    src={user.imageUrl}
                    className={styles.avatar}
                    title={`${user.name || user.email || user.username} (id: ${
                        user.id
                    })`}
                />
            </TableCell>
            <TableCell className={styles.leftTableCell}>
                <Typography variant="body2" data-loading>
                    <Highlighter search={search}>{user.name}</Highlighter>
                </Typography>
            </TableCell>
            <TableCell
                className={classnames(styles.leftTableCell, styles.hideSM)}
            >
                <Typography variant="body2" data-loading>
                    <Highlighter search={search}>
                        {user.username || user.email}
                    </Highlighter>
                </Typography>
            </TableCell>
            <TableCell className={styles.hideXS}>
                <Typography variant="body2" data-loading>
                    {renderRole(user.rootRole)}
                </Typography>
            </TableCell>
            <TableCell className={styles.hideXS}>
                <ConditionallyRender
                    condition={Boolean(user.seenAt)}
                    show={() => renderTimeAgo(user.seenAt!)}
                    elseShow={
                        <Typography noWrap variant="body2" data-loading>
                            Never logged
                        </Typography>
                    }
                />
            </TableCell>
            <ConditionallyRender
                condition={hasAccess(ADMIN)}
                show={
                    <TableCell
                        align="center"
                        className={styles.shrinkTableCell}
                    >
                        <Tooltip title="Edit user" arrow>
                            <IconButton
                                data-loading
                                onClick={() =>
                                    navigate(`/admin/users/${user.id}/edit`)
                                }
                                size="large"
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Change password" arrow>
                            <IconButton
                                data-loading
                                onClick={openPwDialog(user)}
                                size="large"
                            >
                                <Lock />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove user" arrow>
                            <IconButton
                                data-loading
                                onClick={openDelDialog(user)}
                                size="large"
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                }
                elseShow={<TableCell />}
            />
        </TableRow>
    );
};

export default UserListItem;
