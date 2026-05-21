import { useEffect, useMemo, useState, type FC } from 'react';
import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useSearchParams, Link } from 'react-router-dom';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { createLocalStorage } from 'utils/createLocalStorage';
import type { IGroupUser } from 'interfaces/group';
import { useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { MainHeader } from 'component/common/MainHeader/MainHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { RemoveGroup } from 'component/admin/groups/RemoveGroup/RemoveGroup';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { EditGroupUsers } from './EditGroupUsers/EditGroupUsers.tsx';
import { RemoveGroupUser } from './RemoveGroupUser/RemoveGroupUser.tsx';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import {
    UG_EDIT_BTN_ID,
    UG_DELETE_BTN_ID,
    UG_EDIT_USERS_BTN_ID,
    UG_REMOVE_USER_BTN_ID,
} from 'utils/testIds';
import { useScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';
import { scimGroupTooltip } from '../group-constants.ts';

export const groupUsersPlaceholder: IGroupUser[] = Array(15).fill({
    name: 'Name of the user',
    username: 'Username of the user',
});

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort = { id: 'joinedAt', desc: true };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'Group:v1',
    defaultSort,
);

export const Group: FC = () => {
    const groupId = Number(useRequiredPathParam('groupId'));
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { group, loading } = useGroup(groupId);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [editUsersOpen, setEditUsersOpen] = useState(false);
    const [removeUserOpen, setRemoveUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IGroupUser>();

    const {
        settings: { enabled: scimEnabled },
    } = useScimSettings();
    const isScimGroup = scimEnabled && Boolean(group?.scimId);

    const columns = useMemo<ColumnDef<IGroupUser, unknown>[]>(
        () => [
            {
                id: 'imageUrl',
                header: 'Avatar',
                accessorKey: 'imageUrl',
                cell: ({ row: { original: user } }) => (
                    <TextCell>
                        <UserAvatar user={user} />
                    </TextCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 85 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.name || '',
                cell: ({ getValue, row: { original: row } }) => (
                    <HighlightCell
                        value={String(getValue() ?? '')}
                        subtitle={row.email || row.username}
                    />
                ),
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'joinedAt',
                header: 'Joined',
                accessorKey: 'joinedAt',
                cell: DateCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'createdBy',
                header: 'Added by',
                accessorKey: 'createdBy',
                cell: HighlightCell,
                meta: { minWidth: 90, searchable: true },
            },
            {
                id: 'seenAt',
                header: 'Last login',
                accessorKey: 'seenAt',
                cell: TimeAgoCell,
                meta: { maxWidth: 150 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: rowUser } }) => (
                    <ActionCell>
                        <Tooltip
                            title={
                                isScimGroup
                                    ? scimGroupTooltip
                                    : 'Remove user from group'
                            }
                            arrow
                            describeChild
                        >
                            <span>
                                <IconButton
                                    data-testid={`${UG_REMOVE_USER_BTN_ID}-${rowUser.id}`}
                                    onClick={() => {
                                        setSelectedUser(rowUser);
                                        setRemoveUserOpen(true);
                                    }}
                                    disabled={isScimGroup}
                                >
                                    <Delete />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </ActionCell>
                ),
                enableSorting: false,
                meta: { maxWidth: 100, align: 'center' },
            },
            // Always hidden -- for search
            {
                id: 'username',
                header: 'Username',
                accessorFn: (row) => row.username || '',
                meta: { searchable: true },
            },
            {
                id: 'email',
                header: 'Email',
                accessorFn: (row) => row.email || '',
                meta: { searchable: true },
            },
        ],
        [isScimGroup],
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sorting: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        columnVisibility: { username: false, email: false },
        globalFilter: searchParams.get('search') || '',
    }));
    const [searchValue, setSearchValue] = useState(initialState.globalFilter);

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, group?.users ?? []);

    const data = useMemo(
        () =>
            searchedData?.length === 0 && loading
                ? groupUsersPlaceholder
                : searchedData,
        [searchedData, loading],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const sorting = table.getState().sorting;
    const rows = table.getRowModel().rows;

    useEffect(() => {
        const sortRule = sorting[0];
        if (!sortRule) {
            return;
        }
        const tableState: PageQueryType = {};
        tableState.sort = sortRule.id;
        if (sortRule.desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortRule.id, desc: sortRule.desc || false });
    }, [sorting, searchValue, setSearchParams]);

    return (
        <ConditionallyRender
            condition={Boolean(group)}
            show={
                <>
                    <MainHeader
                        title={group?.name}
                        description={group?.description}
                        actions={
                            <>
                                <PermissionIconButton
                                    data-testid={UG_EDIT_BTN_ID}
                                    to={`/admin/groups/${groupId}/edit`}
                                    component={Link}
                                    nativeButton={false}
                                    data-loading
                                    permission={ADMIN}
                                    tooltipProps={{
                                        title: isScimGroup
                                            ? scimGroupTooltip
                                            : 'Edit group',
                                    }}
                                >
                                    <Edit />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    data-testid={UG_DELETE_BTN_ID}
                                    data-loading
                                    onClick={() => setRemoveOpen(true)}
                                    permission={ADMIN}
                                    tooltipProps={{
                                        title: 'Delete group',
                                    }}
                                >
                                    <Delete />
                                </PermissionIconButton>
                            </>
                        }
                    />
                    <PageContent
                        isLoading={loading}
                        header={
                            <PageHeader
                                secondary
                                title={`Users (${
                                    rows.length < data.length
                                        ? `${rows.length} of ${data.length}`
                                        : data.length
                                })`}
                                actions={
                                    <>
                                        <ConditionallyRender
                                            condition={!isSmallScreen}
                                            show={
                                                <>
                                                    <Search
                                                        initialValue={
                                                            searchValue
                                                        }
                                                        onChange={
                                                            setSearchValue
                                                        }
                                                        hasFilters
                                                        getSearchContext={
                                                            getSearchContext
                                                        }
                                                    />
                                                    <PageHeader.Divider />
                                                </>
                                            }
                                        />
                                        <ResponsiveButton
                                            data-testid={UG_EDIT_USERS_BTN_ID}
                                            onClick={() => {
                                                setEditUsersOpen(true);
                                            }}
                                            maxWidth='700px'
                                            Icon={Add}
                                            permission={ADMIN}
                                            disabled={isScimGroup}
                                            tooltipProps={{
                                                title: isScimGroup
                                                    ? scimGroupTooltip
                                                    : '',
                                            }}
                                        >
                                            Edit users
                                        </ResponsiveButton>
                                    </>
                                }
                            >
                                <ConditionallyRender
                                    condition={isSmallScreen}
                                    show={
                                        <Search
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                            hasFilters
                                            getSearchContext={getSearchContext}
                                        />
                                    }
                                />
                            </PageHeader>
                        }
                    >
                        <SearchHighlightProvider
                            value={getSearchText(searchValue)}
                        >
                            <VirtualizedTable tableInstance={table} />
                        </SearchHighlightProvider>
                        <ConditionallyRender
                            condition={rows.length === 0}
                            show={
                                <ConditionallyRender
                                    condition={searchValue?.length > 0}
                                    show={
                                        <TablePlaceholder>
                                            No users found matching &ldquo;
                                            {searchValue}
                                            &rdquo; in this group.
                                        </TablePlaceholder>
                                    }
                                    elseShow={
                                        <TablePlaceholder>
                                            This group is empty. Get started by
                                            adding a user to the group.
                                        </TablePlaceholder>
                                    }
                                />
                            }
                        />
                        <RemoveGroup
                            open={removeOpen}
                            setOpen={setRemoveOpen}
                            group={group!}
                        />
                        <EditGroupUsers
                            open={editUsersOpen}
                            setOpen={setEditUsersOpen}
                            group={group!}
                        />
                        <RemoveGroupUser
                            open={removeUserOpen}
                            setOpen={setRemoveUserOpen}
                            user={selectedUser}
                            group={group!}
                        />
                    </PageContent>
                </>
            }
        />
    );
};
