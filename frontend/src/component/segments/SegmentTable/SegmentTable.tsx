import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    TableSearch,
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
import { useMediaQuery, Box } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { useMemo, useEffect, useState } from 'react';
import { SegmentEmpty } from 'component/segments/SegmentEmpty/SegmentEmpty';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { DonutLarge } from '@mui/icons-material';
import { SegmentActionCell } from 'component/segments/SegmentActionCell/SegmentActionCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import theme from 'themes/theme';
import { SegmentDocsWarning } from 'component/segments/SegmentDocs/SegmentDocs';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const SegmentTable = () => {
    const { segments, loading } = useSegments();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [initialState] = useState({
        sortBy: [{ id: 'createdAt', desc: false }],
        hiddenColumns: ['description'],
    });

    const data = useMemo(() => {
        return (
            segments ??
            Array(5).fill({
                name: 'Segment name',
                description: 'Segment descripton',
                createdAt: new Date().toISOString(),
                createdBy: 'user',
            })
        );
    }, [segments]);

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
            autoResetSortBy: false,
            disableSortRemove: true,
            defaultColumn: {
                Cell: HighlightCell,
            },
        },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        if (isSmallScreen) {
            setHiddenColumns(['description', 'createdAt', 'createdBy']);
        } else {
            setHiddenColumns(['description']);
        }
    }, [setHiddenColumns, isSmallScreen]);

    return (
        <PageContent
            header={
                <PageHeader
                    title="Segments"
                    actions={
                        <>
                            <TableSearch
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
            <Box sx={{ mb: 4 }}>
                <SegmentDocsWarning />
            </Box>
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
        width: '80%',
        Cell: ({ value, row: { original } }: any) => (
            <HighlightCell value={value} subtitle={original.description} />
        ),
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
