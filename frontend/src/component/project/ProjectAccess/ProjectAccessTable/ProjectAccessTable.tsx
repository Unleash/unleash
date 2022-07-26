import { useEffect, useMemo, useState, VFC } from 'react';
import { SortingRule, useFlexLayout, useSortBy, useTable } from 'react-table';
import { VirtualizedTable, TablePlaceholder } from 'component/common/Table';
import { Button, useMediaQuery, useTheme } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { sortTypes } from 'utils/sortTypes';
import useProjectAccess, {
    ENTITY_TYPE,
    IProjectAccess,
} from 'hooks/api/getters/useProjectAccess/useProjectAccess';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useSearch } from 'hooks/useSearch';
import { useSearchParams } from 'react-router-dom';
import { createLocalStorage } from 'utils/createLocalStorage';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Search } from 'component/common/Search/Search';
import { ProjectAccessAssign } from 'component/project/ProjectAccess/ProjectAccessAssign/ProjectAccessAssign';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import useToast from 'hooks/useToast';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ProjectGroupView } from '../ProjectGroupView/ProjectGroupView';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { IUser } from 'interfaces/user';
import { IGroup } from 'interfaces/group';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

export type PageQueryType = Partial<
    Record<'sort' | 'order' | 'search', string>
>;

const defaultSort: SortingRule<string> = { id: 'added' };

const { value: storedParams, setValue: setStoredParams } = createLocalStorage(
    'ProjectAccess:v1',
    defaultSort
);

export const ProjectAccessTable: VFC = () => {
    const projectId = useRequiredPathParam('projectId');

    const { uiConfig } = useUiConfig();
    const { flags } = uiConfig;
    const entityType = flags.UG ? 'user / group' : 'user';

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { setToastData } = useToast();

    const { access, refetchProjectAccess } = useProjectAccess(projectId);
    const { removeUserFromRole, removeGroupFromRole } = useProjectApi();
    const [assignOpen, setAssignOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<IProjectAccess>();

    useEffect(() => {
        if (!assignOpen && !groupOpen) {
            setSelectedRow(undefined);
        }
    }, [assignOpen, groupOpen]);

    const roles = useMemo(
        () => access.roles || [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(access.roles)]
    );

    const mappedData: IProjectAccess[] = useMemo(() => {
        const users = access.users || [];
        const groups = access.groups || [];
        return [
            ...users.map(user => ({
                entity: user,
                type: ENTITY_TYPE.USER,
            })),
            ...groups.map(group => ({
                entity: group,
                type: ENTITY_TYPE.GROUP,
            })),
        ];
    }, [access]);

    const columns = useMemo(
        () => [
            {
                Header: 'Avatar',
                accessor: 'imageUrl',
                Cell: ({ row: { original: row } }: any) => (
                    <TextCell>
                        <UserAvatar user={row.entity}>
                            {row.entity.users?.length}
                        </UserAvatar>
                    </TextCell>
                ),
                maxWidth: 85,
                disableSortBy: true,
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: (row: IProjectAccess) => row.entity.name || '',
                Cell: ({ value, row: { original: row } }: any) => (
                    <ConditionallyRender
                        condition={row.type === ENTITY_TYPE.GROUP}
                        show={
                            <LinkCell
                                onClick={() => {
                                    setSelectedRow(row);
                                    setGroupOpen(true);
                                }}
                                title={value}
                                subtitle={`${row.entity.users?.length} users`}
                            />
                        }
                        elseShow={<HighlightCell value={value} />}
                    />
                ),
                minWidth: 100,
                searchable: true,
            },
            {
                id: 'username',
                Header: 'Username',
                accessor: (row: IProjectAccess) => {
                    if (row.type === ENTITY_TYPE.USER) {
                        const userRow = row.entity as IUser;
                        return userRow.username || userRow.email;
                    }
                    return '';
                },
                Cell: HighlightCell,
                minWidth: 100,
                searchable: true,
            },
            {
                Header: 'Role',
                accessor: (row: IProjectAccess) =>
                    roles.find(({ id }) => id === row.entity.roleId)?.name,
                minWidth: 120,
                filterName: 'role',
            },
            {
                id: 'added',
                Header: 'Added',
                accessor: (row: IProjectAccess) => {
                    const userRow = row.entity as IUser | IGroup;
                    return userRow.addedAt || '';
                },
                Cell: ({ value }: { value: Date }) => (
                    <TimeAgoCell value={value} emptyText="Never logged" />
                ),
                sortType: 'date',
                maxWidth: 150,
            },
            {
                Header: 'Last login',
                accessor: (row: IProjectAccess) => {
                    if (row.type === ENTITY_TYPE.USER) {
                        const userRow = row.entity as IUser;
                        return userRow.seenAt || '';
                    }
                    const userGroup = row.entity as IGroup;
                    return userGroup.users
                        .map(({ seenAt }) => seenAt)
                        .sort()
                        .reverse()[0];
                },
                Cell: ({ value }: { value: Date }) => (
                    <TimeAgoCell value={value} emptyText="Never logged" />
                ),
                sortType: 'date',
                maxWidth: 150,
            },
            {
                id: 'actions',
                Header: 'Actions',
                disableSortBy: true,
                align: 'center',
                maxWidth: 200,
                Cell: ({ row: { original: row } }: any) => (
                    <ActionCell>
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            projectId={projectId}
                            onClick={() => {
                                setSelectedRow(row);
                                setAssignOpen(true);
                            }}
                            disabled={mappedData.length === 1}
                            tooltipProps={{
                                title:
                                    mappedData.length === 1
                                        ? 'Cannot edit access. A project must have at least one owner'
                                        : 'Edit access',
                            }}
                        >
                            <Edit />
                        </PermissionIconButton>
                        <PermissionIconButton
                            permission={UPDATE_PROJECT}
                            projectId={projectId}
                            onClick={() => {
                                setSelectedRow(row);
                                setRemoveOpen(true);
                            }}
                            disabled={mappedData.length === 1}
                            tooltipProps={{
                                title:
                                    mappedData.length === 1
                                        ? 'Cannot remove access. A project must have at least one owner'
                                        : 'Remove access',
                            }}
                        >
                            <Delete />
                        </PermissionIconButton>
                    </ActionCell>
                ),
            },
        ],
        [roles, mappedData.length, projectId]
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
        globalFilter: searchParams.get('search') || '',
    }));
    const [searchValue, setSearchValue] = useState(initialState.globalFilter);

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        mappedData ?? []
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
            defaultColumn: {
                Cell: TextCell,
            },
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

    const removeAccess = async (userOrGroup?: IProjectAccess) => {
        if (!userOrGroup) return;
        const { id, roleId } = userOrGroup.entity;
        let name = userOrGroup.entity.name;
        if (userOrGroup.type === ENTITY_TYPE.USER) {
            const user = userOrGroup.entity as IUser;
            name = name || user.email || user.username || '';
        }

        try {
            if (userOrGroup.type === ENTITY_TYPE.USER) {
                await removeUserFromRole(projectId, roleId, id);
            } else {
                await removeGroupFromRole(projectId, roleId, id);
            }
            refetchProjectAccess();
            setToastData({
                type: 'success',
                title: `${
                    name || `The ${entityType}`
                } has been removed from project`,
            });
        } catch (err: any) {
            setToastData({
                type: 'error',
                title:
                    err.message ||
                    `Server problems when removing ${entityType}.`,
            });
        }
        setRemoveOpen(false);
        setSelectedRow(undefined);
    };
    return (
        <PageContent
            header={
                <PageHeader
                    secondary
                    title={`Access (${
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
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setAssignOpen(true)}
                            >
                                Assign {entityType}
                            </Button>
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
            <ProjectAccessAssign
                open={assignOpen}
                setOpen={setAssignOpen}
                selected={selectedRow}
                accesses={mappedData}
                roles={roles}
                entityType={entityType}
            />
            <Dialogue
                open={removeOpen}
                onClick={() => removeAccess(selectedRow)}
                onClose={() => {
                    setSelectedRow(undefined);
                    setRemoveOpen(false);
                }}
                title={`Really remove ${entityType} from this project?`}
            />
            <ProjectGroupView
                open={groupOpen}
                setOpen={setGroupOpen}
                group={selectedRow?.entity as IGroup}
                projectId={projectId}
                subtitle={`Role: ${
                    roles.find(({ id }) => id === selectedRow?.entity.roleId)
                        ?.name
                }`}
                onEdit={() => {
                    setAssignOpen(true);
                    console.log('Assign Open true');
                }}
                onRemove={() => {
                    setGroupOpen(false);
                    setRemoveOpen(true);
                }}
            />
        </PageContent>
    );
};
