import { useEffect, useMemo, useState, VFC } from 'react';
import {
    IconButton,
    styled,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useSearchParams, Link } from 'react-router-dom';
import { SortingRule, useFlexLayout, useSortBy, useTable } from 'react-table';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { useGroup } from 'hooks/api/getters/useGroup/useGroup';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { sortTypes } from 'utils/sortTypes';
import { createLocalStorage } from 'utils/createLocalStorage';
import { IGroupUser } from 'interfaces/group';
import { useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Add, Delete, Edit } from '@mui/icons-material';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { MainHeader } from 'component/common/MainHeader/MainHeader';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { RemoveGroup } from 'component/admin/groups/RemoveGroup/RemoveGroup';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { EditGroupUsers } from './EditGroupUsers/EditGroupUsers';
import { RemoveGroupUser } from './RemoveGroupUser/RemoveGroupUser';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import {
    UG_EDIT_BTN_ID,
    UG_DELETE_BTN_ID,
    UG_EDIT_USERS_BTN_ID,
    UG_REMOVE_USER_BTN_ID,
} from 'utils/testIds';

const StyledEdit = styled(Edit)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
}));

const StyledDelete = styled(Delete)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
}));

export const groupUsersPlaceholder: IGroupUser[] = Array(15).fill({
    name: 'Name of the user',
    username: 'Username of the user',
});

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'joinedAt' };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'Group:v1',
    defaultSort
);

export const Group: VFC = () => {
    const groupId = Number(useRequiredPathParam('groupId'));
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { group, loading } = useGroup(groupId);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [editUsersOpen, setEditUsersOpen] = useState(false);
    const [removeUserOpen, setRemoveUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IGroupUser>();

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: user } }: any) => (
                    <TextCell>
                        <UserAvatar user={user} />
                    </TextCell>
                ),
                maxWidth: 85,
                disableSortBy: true,
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: IGroupUser) => row.name || '',
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                id: 'username',
                Header: 'Username',
                accessor: (row: IGroupUser) => row.username || row.email,
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Joined',
                accessor: 'joinedAt',
                Cell: DateCell,
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Last login',
                accessor: (row: IGroupUser) => row.seenAt || '',
                Cell: ({ row: { original: user } }: any) => (
                    <TimeAgoCell
                        value={user.seenAt}
                        emptyText="Never"
                        title={date => `Last login: ${date}`}
                    />
                ),
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original: rowUser } }: any) => (
                    <ActionCell>
                        <Tooltip
                            title="Remove user from group"
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
                                >
                                    <Delete />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </ActionCell>
                ),
                maxWidth: 100,
                disableSortBy: true,
            },
        ],
        [setSelectedUser, setRemoveUserOpen]
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['description'],
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
        [searchedData, loading]
    );

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
    } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    useEffect(() => {
        const tableState: PageQueryType = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [sortBy, searchValue, setSearchParams]);

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
                                    data-loading
                                    permission={ADMIN}
                                    tooltipProps={{
                                        title: 'Edit group',
                                    }}
                                >
                                    <StyledEdit />
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
                                    <StyledDelete />
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
                                            maxWidth="700px"
                                            Icon={Add}
                                            permission={ADMIN}
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
                            <VirtualizedTable
                                rows={rows}
                                headerGroups={headerGroups}
                                prepareRow={prepareRow}
                            />
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
