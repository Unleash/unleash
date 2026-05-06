import { useEffect, useMemo, useState, type FC } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import useProjectAccess, {
    ENTITY_TYPE,
    type IProjectAccess,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import {
    PROJECT_USER_ACCESS_WRITE,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useSearch } from 'hooks/useSearch';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import {
    Link,
    Route,
    Routes,
    useNavigate,
    useSearchParams,
} from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useToast from 'hooks/useToast';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectGroupView } from '../ProjectGroupView/ProjectGroupView.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import type { IUser } from 'interfaces/user';
import type { IGroup } from 'interfaces/group';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { ProjectAccessCreate } from 'component/project/ProjectAccess/ProjectAccessCreate/ProjectAccessCreate';
import { ProjectAccessEditUser } from 'component/project/ProjectAccess/ProjectAccessEditUser/ProjectAccessEditUser';
import { ProjectAccessEditGroup } from 'component/project/ProjectAccess/ProjectAccessEditGroup/ProjectAccessEditGroup';
import { RoleCell } from 'component/common/Table/cells/RoleCell/RoleCell';
import {
    PA_ASSIGN_BUTTON_ID,
    PA_EDIT_BUTTON_ID,
    PA_REMOVE_BUTTON_ID,
} from 'utils/testIds';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort = { id: 'added', desc: true };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'ProjectAccess:v1',
    defaultSort,
);

const StyledUserAvatars = styled('div')(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: theme.spacing(1),
}));

const StyledEmptyAvatar = styled(UserAvatar)(({ theme }) => ({
    marginRight: theme.spacing(-3.5),
}));

const StyledGroupAvatar = styled(UserAvatar)(({ theme }) => ({
    outline: `${theme.spacing(0.25)} solid ${theme.palette.background.paper}`,
}));

const hiddenColumnsSmall = ['imageUrl', 'role', 'added', 'lastLogin'];
const hiddenColumnsMedium = ['lastLogin', 'added'];

export const ProjectAccessTable: FC = () => {
    const projectId = useRequiredPathParam('projectId');

    const { uiConfig } = useUiConfig();
    const { flags } = uiConfig;
    const entityType = flags.UG ? 'user / group' : 'user';

    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const { setToastData } = useToast();

    const { access, refetchProjectAccess } = useProjectAccess(projectId);
    const { removeUserAccess, removeGroupAccess } = useProjectApi();
    const [removeOpen, setRemoveOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IProjectAccess>();

    const roleText = (roles: number[]): string =>
        roles.length > 1
            ? `${roles.length} roles`
            : access?.roles.find(({ id }) => id === roles[0])?.name || '';

    const columns = useMemo<ColumnDef<IProjectAccess, unknown>[]>(
        () => [
            {
                id: 'imageUrl',
                header: 'Avatar',
                cell: ({ row: { original: row } }) => (
                    <StyledUserAvatars>
                        <ConditionallyRender
                            condition={row.type === ENTITY_TYPE.GROUP}
                            show={<StyledEmptyAvatar />}
                        />
                        <StyledGroupAvatar user={row.entity}>
                            {(row.entity as IGroup).users?.length}
                        </StyledGroupAvatar>
                    </StyledUserAvatars>
                ),
                enableSorting: false,
                meta: { maxWidth: 85 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorFn: (row) => row.entity.name || '',
                cell: ({ getValue, row: { original: row } }) => (
                    <ConditionallyRender
                        condition={row.type === ENTITY_TYPE.GROUP}
                        show={
                            <LinkCell
                                onClick={() => {
                                    setSelectedRow(row);
                                    setGroupOpen(true);
                                }}
                                title={String(getValue() ?? '')}
                                subtitle={`${(row.entity as IGroup).users?.length} users`}
                            />
                        }
                        elseShow={
                            <HighlightCell
                                value={String(getValue() ?? '')}
                                subtitle={
                                    (row.entity as IUser)?.email ||
                                    (row.entity as IUser)?.username
                                }
                            />
                        }
                    />
                ),
                meta: { minWidth: 100, searchable: true },
            },
            {
                id: 'role',
                header: 'Role',
                accessorFn: (row) => roleText(row.entity.roles),
                cell: ({ getValue, row: { original: row } }) => (
                    <RoleCell
                        value={String(getValue() ?? '')}
                        roles={row.entity.roles}
                    />
                ),
                meta: { maxWidth: 175, filterName: 'role' },
            },
            {
                id: 'added',
                header: 'Added',
                accessorFn: (row) =>
                    (row.entity as { addedAt?: string | null }).addedAt,
                cell: TimeAgoCell,
                meta: { maxWidth: 130 },
            },
            {
                id: 'lastLogin',
                header: 'Last login',
                accessorFn: (row) => {
                    if (row.type !== ENTITY_TYPE.GROUP) {
                        const userRow = row.entity as IUser;
                        return userRow.seenAt || '';
                    }
                    const userGroup = row.entity as IGroup;
                    return userGroup.users
                        .map(({ seenAt }) => seenAt)
                        .sort()
                        .reverse()[0];
                },
                cell: TimeAgoCell,
                meta: { maxWidth: 130 },
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({ row: { original: row } }) => (
                    <ActionCell>
                        <PermissionIconButton
                            data-testid={PA_EDIT_BUTTON_ID}
                            component={Link}
                            nativeButton={false}
                            permission={[
                                UPDATE_PROJECT,
                                PROJECT_USER_ACCESS_WRITE,
                            ]}
                            projectId={projectId}
                            to={`edit/${
                                row.type === ENTITY_TYPE.GROUP
                                    ? 'group'
                                    : 'user'
                            }/${row.entity.id}`}
                            tooltipProps={{
                                title: 'Edit access',
                            }}
                        >
                            <Edit />
                        </PermissionIconButton>
                        <PermissionIconButton
                            data-testid={PA_REMOVE_BUTTON_ID}
                            permission={[
                                UPDATE_PROJECT,
                                PROJECT_USER_ACCESS_WRITE,
                            ]}
                            projectId={projectId}
                            onClick={() => {
                                setSelectedRow(row);
                                setRemoveOpen(true);
                            }}
                            tooltipProps={{
                                title: 'Remove access',
                            }}
                        >
                            <Delete />
                        </PermissionIconButton>
                    </ActionCell>
                ),
                meta: { maxWidth: 150, align: 'center' },
            },
            // Always hidden -- for search
            {
                id: 'username',
                header: 'Username',
                accessorFn: (row) =>
                    row.type !== ENTITY_TYPE.GROUP
                        ? (row.entity as IUser)?.username || ''
                        : '',
                meta: { searchable: true },
            },
            {
                id: 'email',
                header: 'Email',
                accessorFn: (row) =>
                    row.type !== ENTITY_TYPE.GROUP
                        ? (row.entity as IUser)?.email || ''
                        : '',
                meta: { searchable: true },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [access, projectId],
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

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        access?.rows ?? [],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        defaultColumn: {
            cell: ({ getValue }) => (
                <TextCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isSmallScreen,
                columns: hiddenColumnsSmall,
            },
            {
                condition: isMediumScreen,
                columns: hiddenColumnsMedium,
            },
        ],
        table.setColumnVisibility,
        columns,
    );

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

    const removeAccess = async (userOrGroup?: IProjectAccess) => {
        if (!userOrGroup) return;
        const { id } = userOrGroup.entity;
        let name = userOrGroup.entity.name;
        if (userOrGroup.type !== ENTITY_TYPE.GROUP) {
            const user = userOrGroup.entity as IUser;
            name = name || user.email || user.username || '';
        }

        try {
            if (userOrGroup.type !== ENTITY_TYPE.GROUP) {
                await removeUserAccess(projectId, id);
            } else {
                await removeGroupAccess(projectId, id);
            }
            refetchProjectAccess();
            setToastData({
                type: 'success',
                text: `${
                    name || `The ${entityType}`
                } has been removed from project`,
            });
        } catch (err: any) {
            setToastData({
                type: 'error',
                text:
                    err.message ||
                    `Server problems when removing ${entityType}.`,
            });
        }
        setRemoveOpen(false);
    };

    return (
        <PageContent
            header={
                <PageHeader
                    secondary
                    title={`User access (${
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
                                            initialValue={searchValue}
                                            onChange={setSearchValue}
                                            hasFilters
                                            getSearchContext={getSearchContext}
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                            <ResponsiveButton
                                onClick={() => navigate('create')}
                                maxWidth='700px'
                                Icon={Add}
                                permission={[
                                    UPDATE_PROJECT,
                                    PROJECT_USER_ACCESS_WRITE,
                                ]}
                                projectId={projectId}
                                data-testid={PA_ASSIGN_BUTTON_ID}
                            >
                                Assign {entityType}
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
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTableV8 tableInstance={table} />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No access found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No access available. Get started by assigning a{' '}
                                {entityType}.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <Routes>
                <Route path='create' element={<ProjectAccessCreate />} />
                <Route
                    path='edit/group/:groupId'
                    element={<ProjectAccessEditGroup />}
                />
                <Route
                    path='edit/user/:userId'
                    element={<ProjectAccessEditUser />}
                />
            </Routes>
            <Dialogue
                open={removeOpen}
                onClick={() => removeAccess(selectedRow)}
                onClose={() => {
                    setRemoveOpen(false);
                }}
                title={`Really remove ${entityType} from this project?`}
            />
            <ProjectGroupView
                open={groupOpen}
                setOpen={setGroupOpen}
                group={selectedRow?.entity as IGroup}
                projectId={projectId}
                subtitle={
                    <>
                        {selectedRow && selectedRow.entity.roles.length > 1
                            ? 'Roles:'
                            : 'Role:'}
                        <RoleCell
                            value={roleText(selectedRow?.entity.roles || [])}
                            roles={selectedRow?.entity.roles || []}
                        />
                    </>
                }
                onEdit={() => {
                    navigate(`edit/group/${selectedRow?.entity.id}`);
                }}
                onRemove={() => {
                    setGroupOpen(false);
                    setRemoveOpen(true);
                }}
            />
        </PageContent>
    );
};
