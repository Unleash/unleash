import { memo, useMemo } from 'react';
import { styled, TableContainer, Typography } from '@mui/material';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TablePlaceholder,
    TableRow,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useTagValues } from 'hooks/api/getters/useTagValues/useTagValues';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { TagValueUsageCell } from './TagValueUsageCell.tsx';

const StyledSection = styled('section')(({ theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxHeight: theme.spacing(50),
    marginTop: theme.spacing(1.5),
}));

const StyledTable = styled(Table)(({ theme }) => ({
    // CellSortable sets position: relative, which cancels stickyHeader.
    '& thead th': {
        position: 'sticky',
        top: 0,
        zIndex: 2,
        backgroundColor: theme.palette.table.headerBackground,
        fontWeight: theme.typography.fontWeightRegular,
        borderBottom: 0,
    },
}));

const StyledTruncationNotice = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
}));

const compareValues = (
    a: TagValuesUsageSchemaTagValuesItem,
    b: TagValuesUsageSchemaTagValuesItem,
) => a.value.localeCompare(b.value, undefined, { numeric: true });

const columns: ColumnDef<TagValuesUsageSchemaTagValuesItem>[] = [
    {
        id: 'value',
        header: 'Value',
        accessorKey: 'value',
        cell: ({ getValue }) => <TextCell getValue={getValue} />,
        sortingFn: (a, b) => compareValues(a.original, b.original),
    },
    {
        id: 'usedIn',
        header: 'Used in',
        accessorKey: 'usedInActiveFeatures',
        cell: ({ row }) => <TagValueUsageCell {...row.original} />,
        meta: { width: 140 },
    },
];

const TagValuesTableComponent = ({ tagType }: { tagType: string }) => {
    const { tagValues, total, error, loading } = useTagValues(tagType);
    // Tanstack breaks ties by row index, in both directions, so presorting
    // by value keeps tied values in ascending order whichever way usage sorts.
    const data = useMemo(() => [...tagValues].sort(compareValues), [tagValues]);

    const table = useReactTable({
        columns,
        data,
        initialState: { sorting: [{ id: 'value', desc: false }] },
        getRowId: ({ value }) => value,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return (
        <StyledSection>
            <Typography variant='h3' component='h2'>
                Tag values
            </Typography>
            <StyledTableContainer>
                <StyledTable stickyHeader rowHeight='standard'>
                    <SortableTableHeader tableInstance={table} />
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
            {total > tagValues.length ? (
                <StyledTruncationNotice variant='body2'>
                    Showing the first {tagValues.length} of {total} values.
                </StyledTruncationNotice>
            ) : null}
            {error ? (
                <TablePlaceholder>
                    Couldn't load the tag values.
                </TablePlaceholder>
            ) : null}
            {!loading && !error && tagValues.length === 0 ? (
                <TablePlaceholder>
                    No values for this tag type yet.
                </TablePlaceholder>
            ) : null}
        </StyledSection>
    );
};

export const TagValuesTable = memo(TagValuesTableComponent);
