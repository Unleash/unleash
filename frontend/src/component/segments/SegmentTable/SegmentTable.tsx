import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    Table,
    TableBody,
    TableCell,
    TablePlaceholder,
    TableRow,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { CreateSegmentButton } from 'component/segments/CreateSegmentButton/CreateSegmentButton';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useMediaQuery } from '@mui/material';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useMemo, useState } from 'react';
import { SegmentEmpty } from 'component/segments/SegmentEmpty';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import DonutLarge from '@mui/icons-material/DonutLarge';
import { SegmentActionCell } from 'component/segments/SegmentActionCell/SegmentActionCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { UsedInCell } from 'component/context/ContextList/UsedInCell';
import type { ISegment } from 'interfaces/segment';

export const SegmentTable = () => {
    const projectId = useOptionalPathParam('projectId');
    const { segments, loading: loadingSegments } = useSegments();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [globalFilter, setGlobalFilter] = useState('');
    const [initialState] = useState({
        sorting: [{ id: 'createdAt', desc: false }],
        columnVisibility: { description: false },
    });

    const data = useMemo<ISegment[]>(() => {
        if (!segments) {
            return Array(5).fill({
                name: 'Segment name',
                description: 'Segment descripton',
                createdAt: new Date().toISOString(),
                createdBy: 'user',
                projectId: 'Project',
            });
        }

        if (projectId) {
            return segments.filter(({ project }) => project === projectId);
        }

        return segments;
    }, [segments, projectId]);

    const columns = useMemo<ColumnDef<ISegment, unknown>[]>(
        () => getColumns(projectId),
        [projectId],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        defaultColumn: {
            cell: ({ getValue }) => (
                <HighlightCell value={String(getValue() ?? '')} />
            ),
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => String(row.id),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdAt', 'createdBy'],
            },
            {
                condition: Boolean(projectId),
                columns: ['project'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rows = table.getRowModel().rows;

    return (
        <PageContent
            header={
                <PageHeader
                    title={`Segments (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={(value) => setGlobalFilter(value)}
                            />
                            <PageHeader.Divider />
                            <CreateSegmentButton />
                        </>
                    }
                />
            }
            isLoading={loadingSegments}
        >
            <ConditionallyRender
                condition={!loadingSegments && data.length === 0}
                show={
                    <TablePlaceholder>
                        <SegmentEmpty />
                    </TablePlaceholder>
                }
                elseShow={() => (
                    <>
                        <SearchHighlightProvider value={globalFilter}>
                            <Table rowHeight='standard'>
                                <SortableTableHeader tableInstance={table} />
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow hover key={row.id}>
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </SearchHighlightProvider>
                        <ConditionallyRender
                            condition={
                                rows.length === 0 && globalFilter?.length > 0
                            }
                            show={
                                <TablePlaceholder>
                                    No segments found matching &ldquo;
                                    {globalFilter}&rdquo;
                                </TablePlaceholder>
                            }
                        />
                    </>
                )}
            />
        </PageContent>
    );
};

const getColumns = (projectId?: string): ColumnDef<ISegment, unknown>[] => [
    {
        id: 'Icon',
        enableGlobalFilter: false,
        enableSorting: false,
        cell: () => <IconCell icon={<DonutLarge color='disabled' />} />,
        meta: { width: '1%' },
    },
    {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        cell: ({
            row: {
                original: { name, description, id },
            },
        }) => (
            <LinkCell
                title={name}
                to={
                    projectId
                        ? `/projects/${projectId}/settings/segments/edit/${id}`
                        : `/segments/edit/${id}`
                }
                subtitle={description}
            />
        ),
        meta: { width: '60%' },
    },
    {
        id: 'usedIn',
        header: 'Used in',
        cell: ({ row: { original } }) => (
            <UsedInCell original={original as never} />
        ),
        meta: { width: '60%' },
    },
    {
        id: 'project',
        header: 'Project',
        accessorKey: 'project',
        cell: ({ getValue }) => {
            const value = String(getValue() ?? '');
            return (
                <ConditionallyRender
                    condition={Boolean(value)}
                    show={<LinkCell title={value} to={`/projects/${value}`} />}
                    elseShow={<TextCell>Global</TextCell>}
                />
            );
        },
        sortingFn: 'alphanumeric',
        meta: { maxWidth: 150, filterName: 'project', searchable: true },
    },
    {
        id: 'createdAt',
        header: 'Created at',
        accessorKey: 'createdAt',
        cell: DateCell,
        enableGlobalFilter: false,
        meta: { minWidth: 150 },
    },
    {
        id: 'createdBy',
        header: 'Created by',
        accessorKey: 'createdBy',
        meta: { width: '25%' },
    },
    {
        id: 'Actions',
        header: 'Actions',
        cell: ({ row: { original } }) => (
            <SegmentActionCell segment={original} />
        ),
        enableSorting: false,
        enableGlobalFilter: false,
        meta: { width: '1%', align: 'center' },
    },
    {
        id: 'description',
        accessorKey: 'description',
    },
];
