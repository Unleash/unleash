import { useMemo, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import { TablePlaceholder } from 'component/common/Table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import {
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { parseUserAgent } from './parseUserAgent';
import {
    useAdminSessions,
    type IAdminSession,
} from 'hooks/api/getters/useAdminSessions/useAdminSessions';
import useAdminSessionsApi from 'hooks/api/actions/useAdminSessionsApi/useAdminSessionsApi';

interface IUserSessionGroup {
    userId: number;
    userName: string | null;
    userEmail: string | null;
    imageUrl: string | null;
    sessions: IAdminSession[];
}

type RevokeTarget =
    | { kind: 'session'; session: IAdminSession }
    | { kind: 'user'; group: IUserSessionGroup };

const StyledGroupRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledGroupName = styled(Box)({
    flex: 1,
    minWidth: 0,
});

const StyledSessionsTable = styled(Table)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    '& .MuiTableCell-root': {
        padding: theme.spacing(0.75, 2),
        fontSize: theme.typography.body2.fontSize,
    },
    '& .MuiTableCell-head': {
        color: theme.palette.text.secondary,
        fontWeight: theme.typography.fontWeightRegular,
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const StyledExpandedArea = styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(7),
}));

interface ISessionRowProps {
    session: IAdminSession;
    onRevoke: (session: IAdminSession) => void;
}

const SessionRow = ({ session, onRevoke }: ISessionRowProps) => (
    <TableRow>
        <TableCell>
            <Tooltip title={session.userAgent ?? ''} placement='top'>
                <span>{parseUserAgent(session.userAgent)}</span>
            </Tooltip>
        </TableCell>
        <TableCell>{session.ipAddress ?? '—'}</TableCell>
        <TableCell>
            <DateCell value={session.createdAt} />
        </TableCell>
        <TableCell>
            {session.createdAt
                ? formatDistanceStrict(new Date(session.createdAt), new Date())
                : '—'}
        </TableCell>
        <TableCell>
            <TimeAgoCell value={session.expired} emptyText='—' />
        </TableCell>
        <TableCell align='right'>
            <Button
                size='small'
                color='error'
                variant='outlined'
                onClick={() => onRevoke(session)}
            >
                Revoke
            </Button>
        </TableCell>
    </TableRow>
);

interface IUserGroupRowProps {
    group: IUserSessionGroup;
    expanded: boolean;
    onToggle: () => void;
    onRevokeSession: (session: IAdminSession) => void;
    onRevokeAll: (group: IUserSessionGroup) => void;
}

const UserGroupRow = ({
    group,
    expanded,
    onToggle,
    onRevokeSession,
    onRevokeAll,
}: IUserGroupRowProps) => (
    <>
        <StyledGroupRow onClick={onToggle}>
            <UserAvatar
                user={{
                    name: group.userName,
                    email: group.userEmail,
                    imageUrl: group.imageUrl,
                }}
            />
            <StyledGroupName>
                <Typography variant='body2' fontWeight='bold' noWrap>
                    {group.userName ||
                        group.userEmail ||
                        `User ${group.userId}`}
                </Typography>
                <ConditionallyRender
                    condition={Boolean(group.userName && group.userEmail)}
                    show={
                        <Typography
                            variant='caption'
                            color='text.secondary'
                            noWrap
                        >
                            {group.userEmail}
                        </Typography>
                    }
                />
            </StyledGroupName>
            <Chip
                label={`${group.sessions.length} ${group.sessions.length === 1 ? 'session' : 'sessions'}`}
                size='small'
                color={group.sessions.length > 1 ? 'warning' : 'default'}
            />
            <Button
                size='small'
                color='error'
                variant='outlined'
                onClick={(e) => {
                    e.stopPropagation();
                    onRevokeAll(group);
                }}
            >
                Revoke all
            </Button>
            <IconButton
                size='small'
                aria-label={expanded ? 'collapse' : 'expand'}
            >
                {expanded ? (
                    <KeyboardArrowUpIcon fontSize='small' />
                ) : (
                    <KeyboardArrowDownIcon fontSize='small' />
                )}
            </IconButton>
        </StyledGroupRow>
        <Collapse in={expanded} unmountOnExit>
            <StyledExpandedArea>
                <StyledSessionsTable size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Browser</TableCell>
                            <TableCell>IP address</TableCell>
                            <TableCell>Session started</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Expires</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {group.sessions.map((session) => (
                            <SessionRow
                                key={session.id}
                                session={session}
                                onRevoke={onRevokeSession}
                            />
                        ))}
                    </TableBody>
                </StyledSessionsTable>
            </StyledExpandedArea>
        </Collapse>
    </>
);

export const ActiveSessions = () => {
    const { isEnterprise } = useUiConfig();

    if (!isEnterprise()) {
        return <PremiumFeature feature='active-sessions' page />;
    }

    return <ActiveSessionsContent />;
};

const ActiveSessionsContent = () => {
    const { sessions, loading, refetch } = useAdminSessions();
    const { deleteSession, deleteSessionsForUser } = useAdminSessionsApi();
    const { setToastData, setToastApiError } = useToast();
    const [revokeTarget, setRevokeTarget] = useState<RevokeTarget | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

    const groups = useMemo<IUserSessionGroup[]>(() => {
        const map = new Map<number, IUserSessionGroup>();
        for (const session of sessions) {
            const existing = map.get(session.userId);
            if (existing) {
                existing.sessions.push(session);
            } else {
                map.set(session.userId, {
                    userId: session.userId,
                    userName: session.userName,
                    userEmail: session.userEmail,
                    imageUrl: session.imageUrl,
                    sessions: [session],
                });
            }
        }
        return Array.from(map.values()).sort(
            (a, b) => b.sessions.length - a.sessions.length,
        );
    }, [sessions]);

    const filteredGroups = useMemo(() => {
        if (!searchValue.trim()) return groups;
        const q = searchValue.toLowerCase();
        return groups
            .map((group) => ({
                ...group,
                sessions: group.sessions.filter(
                    (s) =>
                        group.userName?.toLowerCase().includes(q) ||
                        group.userEmail?.toLowerCase().includes(q) ||
                        s.userAgent?.toLowerCase().includes(q) ||
                        s.ipAddress?.toLowerCase().includes(q),
                ),
            }))
            .filter((g) => g.sessions.length > 0);
    }, [groups, searchValue]);

    const toggleExpanded = (userId: number) => {
        setExpandedUsers((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const onRevokeConfirm = async () => {
        if (!revokeTarget) return;
        try {
            if (revokeTarget.kind === 'session') {
                await deleteSession(revokeTarget.session.id);
                setToastData({ text: 'Session removed', type: 'success' });
            } else {
                await deleteSessionsForUser(revokeTarget.group.userId);
                setToastData({
                    text: `All sessions for ${revokeTarget.group.userName ?? revokeTarget.group.userEmail ?? `user ${revokeTarget.group.userId}`} removed`,
                    type: 'success',
                });
            }
            refetch();
        } catch (e) {
            setToastApiError(formatUnknownError(e));
        } finally {
            setRevokeTarget(null);
        }
    };

    const dialogUser =
        revokeTarget?.kind === 'session'
            ? (revokeTarget.session.userEmail ??
              revokeTarget.session.userName ??
              `user ${revokeTarget.session.userId}`)
            : revokeTarget?.kind === 'user'
              ? (revokeTarget.group.userEmail ??
                revokeTarget.group.userName ??
                `user ${revokeTarget.group.userId}`)
              : '';

    return (
        <PageContent
            header={
                <PageHeader
                    title={`Active sessions (${sessions.length})`}
                    actions={
                        <Search
                            initialValue={searchValue}
                            onChange={setSearchValue}
                        />
                    }
                />
            }
        >
            <ConditionallyRender
                condition={!loading && filteredGroups.length === 0}
                show={
                    <TablePlaceholder>
                        {loading
                            ? 'Loading sessions...'
                            : searchValue
                              ? 'No sessions match your search.'
                              : 'No active sessions found.'}
                    </TablePlaceholder>
                }
                elseShow={
                    <Box>
                        {filteredGroups.map((group) => (
                            <UserGroupRow
                                key={group.userId}
                                group={group}
                                expanded={expandedUsers.has(group.userId)}
                                onToggle={() => toggleExpanded(group.userId)}
                                onRevokeSession={(session) =>
                                    setRevokeTarget({
                                        kind: 'session',
                                        session,
                                    })
                                }
                                onRevokeAll={(g) =>
                                    setRevokeTarget({ kind: 'user', group: g })
                                }
                            />
                        ))}
                    </Box>
                }
            />

            <Dialog
                open={Boolean(revokeTarget)}
                onClose={() => setRevokeTarget(null)}
            >
                <DialogTitle>
                    {revokeTarget?.kind === 'user'
                        ? 'Revoke all sessions'
                        : 'Revoke session'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {revokeTarget?.kind === 'user' ? (
                            <>
                                Are you sure you want to revoke all{' '}
                                <strong>
                                    {revokeTarget.group.sessions.length}
                                </strong>{' '}
                                sessions for <strong>{dialogUser}</strong>? They
                                will be logged out immediately.
                            </>
                        ) : (
                            <>
                                Are you sure you want to revoke the session for{' '}
                                <strong>{dialogUser}</strong>? They will be
                                logged out immediately.
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevokeTarget(null)}>
                        Cancel
                    </Button>
                    <Button
                        color='primary'
                        variant='contained'
                        onClick={onRevokeConfirm}
                    >
                        Revoke
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContent>
    );
};
