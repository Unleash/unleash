import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    SortableTableHeader,
    TableCell,
    TablePlaceholder,
    Table,
    TableBody,
    TableRow,
} from 'component/common/Table';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { CreateSegmentButton } from 'component/segments/CreateSegmentButton/CreateSegmentButton';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useMemo, useState } from 'react';
import { SegmentEmpty } from 'component/segments/SegmentEmpty';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { DonutLarge } from '@mui/icons-material';
import { SegmentActionCell } from 'component/segments/SegmentActionCell/SegmentActionCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';

export const SegmentTable = () => {
    const projectId = useOptionalPathParam('projectId');
    const { segments, loading } = useSegments();
    const { uiConfig } = useUiConfig();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [initialState] = useState({
        sortBy: [{ id: 'createdAt' }],
        hiddenColumns: ['description'],
    });

    const data = useMemo(() => {
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            initialState,
            columns: COLUMNS as any,
            data: data as any,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            defaultColumn: {
                Cell: HighlightCell,
            },
        },
        useGlobalFilter,
        useSortBy
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['createdAt', 'createdBy'],
            },
            {
                condition:
                    Boolean(projectId) ||
                    !Boolean(uiConfig.flags.projectScopedSegments),
                columns: ['project'],
            },
        ],
        setHiddenColumns,
        COLUMNS
    );

    return (
        <PageContent
            header={
                <PageHeader
                    title={`Segments (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <CreateSegmentButton />
                        </>
                    }
                />
            }
            isLoading={loading}
        >
            <ConditionallyRender
                condition={!loading && data.length === 0}
                show={
                    <TablePlaceholder>
                        <SegmentEmpty />
                    </TablePlaceholder>
                }
                elseShow={() => (
                    <>
                        <SearchHighlightProvider value={globalFilter}>
                            <Table {...getTableProps()} rowHeight="standard">
                                <SortableTableHeader
                                    headerGroups={headerGroups as any}
                                />
                                <TableBody {...getTableBodyProps()}>
                                    {rows.map(row => {
                                        prepareRow(row);
                                        return (
                                            <TableRow
                                                hover
                                                {...row.getRowProps()}
                                            >
                                                {row.cells.map(cell => (
                                                    <TableCell
                                                        {...cell.getCellProps()}
                                                    >
                                                        {cell.render('Cell')}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
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

const COLUMNS = [
    {
        id: 'Icon',
        width: '1%',
        disableGlobalFilter: true,
        disableSortBy: true,
        Cell: () => <IconCell icon={<DonutLarge color="disabled" />} />,
    },
    {
        Header: 'Name',
        accessor: 'name',
        width: '60%',
        Cell: ({ value, row: { original } }: any) => (
            <HighlightCell value={value} subtitle={original.description} />
        ),
    },
    {
        Header: 'Project',
        accessor: 'project',
        Cell: ({ value }: { value: string }) => (
            <ConditionallyRender
                condition={Boolean(value)}
                show={<LinkCell title={value} to={`/projects/${value}`} />}
                elseShow={<TextCell>Global</TextCell>}
            />
        ),
        sortType: 'alphanumeric',
        maxWidth: 150,
        filterName: 'project',
        searchable: true,
    },
    {
        Header: 'Created at',
        accessor: 'createdAt',
        minWidth: 150,
        Cell: DateCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'Created by',
        accessor: 'createdBy',
        width: '25%',
    },
    {
        Header: 'Actions',
        id: 'Actions',
        align: 'center',
        width: '1%',
        disableSortBy: true,
        disableGlobalFilter: true,
        Cell: ({ row: { original } }: any) => (
            <SegmentActionCell segment={original} />
        ),
    },
    {
        accessor: 'description',
    },
];
