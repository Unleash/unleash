import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { Search } from 'component/common/Search/Search';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { TablePlaceholder } from 'component/common/Table';
import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useSearch } from 'hooks/useSearch';
import type { IGroup, IGroupUser } from 'interfaces/group';
import { type FC, useState } from 'react';
import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';

const StyledPageContent = styled(PageContent)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    padding: theme.spacing(7.5, 6),
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4, 2),
    },
    '& .header': {
        padding: theme.spacing(0, 0, 2, 0),
    },
    '& .body': {
        padding: theme.spacing(3, 0, 0, 0),
    },
    borderRadius: `${theme.spacing(1.5, 0, 0, 1.5)} !important`,
}));

const StyledTitle = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    '& > span': {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.secondary,
        fontSize: theme.fontSizes.bodySize,
    },
}));

const defaultSort = { id: 'joinedAt', desc: true };

const columns: ColumnDef<IGroupUser, unknown>[] = [
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
        id: 'joined',
        header: 'Joined',
        accessorKey: 'joinedAt',
        cell: DateCell,
        meta: { maxWidth: 150 },
    },
    {
        id: 'lastLogin',
        header: 'Last login',
        accessorKey: 'seenAt',
        cell: TimeAgoCell,
        meta: { maxWidth: 150 },
    },
    // Always hidden -- for search
    {
        id: 'username',
        accessorFn: (row) => row.username || '',
        header: 'Username',
        meta: { searchable: true },
    },
    {
        id: 'email',
        accessorFn: (row) => row.email || '',
        header: 'Email',
        meta: { searchable: true },
    },
];

const hiddenColumnsSmall = ['imageUrl', 'name', 'joined', 'lastLogin'];

interface IProjectGroupViewProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    group: IGroup;
    projectId: string;
    subtitle: React.ReactNode;
    onEdit: () => void;
    onRemove: () => void;
}

export const ProjectGroupView: FC<IProjectGroupViewProps> = ({
    open,
    setOpen,
    group,
    projectId,
    subtitle,
    onEdit,
    onRemove,
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [initialState] = useState(() => ({
        sorting: [
            {
                id: defaultSort.id,
                desc: defaultSort.desc,
            },
        ],
        columnVisibility: { username: false, email: false },
    }));
    const [searchValue, setSearchValue] = useState('');

    const { data, getSearchText, getSearchContext } = useSearch(
        columns,
        searchValue,
        group?.users ?? [],
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

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: hiddenColumnsSmall,
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rows = table.getRowModel().rows;

    return (
        <SidebarModal
            open={open}
            onClose={() => {
                setOpen(false);
            }}
            label={group?.name || 'Group'}
        >
            <StyledPageContent
                header={
                    <PageHeader
                        secondary
                        titleElement={
                            <StyledTitle>
                                {group?.name} (
                                {rows.length < data.length
                                    ? `${rows.length} of ${data.length}`
                                    : data.length}
                                )<span>{subtitle}</span>
                            </StyledTitle>
                        }
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
                                                getSearchContext={
                                                    getSearchContext
                                                }
                                            />
                                            <PageHeader.Divider />
                                        </>
                                    }
                                />
                                <PermissionIconButton
                                    permission={UPDATE_PROJECT}
                                    projectId={projectId}
                                    tooltipProps={{
                                        title: 'Edit group access',
                                    }}
                                    onClick={onEdit}
                                >
                                    <Edit />
                                </PermissionIconButton>
                                <PermissionIconButton
                                    permission={UPDATE_PROJECT}
                                    projectId={projectId}
                                    tooltipProps={{
                                        title: 'Remove group access',
                                    }}
                                    onClick={onRemove}
                                >
                                    <Delete />
                                </PermissionIconButton>
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
                                    This group is empty. Get started by adding a
                                    user to the group.
                                </TablePlaceholder>
                            }
                        />
                    }
                />
            </StyledPageContent>
        </SidebarModal>
    );
};
