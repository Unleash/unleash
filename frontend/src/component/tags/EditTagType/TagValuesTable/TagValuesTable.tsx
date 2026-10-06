import { memo, useCallback, useMemo, useState } from 'react';
import { Box, styled, TableContainer, Typography } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
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
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useTagApi from 'hooks/api/actions/useTagApi/useTagApi';
import { useTagValues } from 'hooks/api/getters/useTagValues/useTagValues';
import { refetchTagTypes } from 'hooks/api/getters/useTagTypes/useTagTypes';
import useToast from 'hooks/useToast';
import { useTracking } from 'hooks/useTracking';
import type { TagValuesUsageSchemaTagValuesItem } from 'openapi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { TagValueCell } from './TagValueCell.tsx';
import { DeleteTagValueDialog } from './TagValueDialogs.tsx';
import { TagValueUsageCell } from './TagValueUsageCell.tsx';
import { openTagValueEditorTracking } from '../../tagsTracking.ts';

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

type RowAction =
    | { status: 'editing'; value: string }
    | { status: 'deleting'; tagValue: TagValuesUsageSchemaTagValuesItem };

const TagValuesTableComponent = ({ tagType }: { tagType: string }) => {
    const { tagValues, total, error, loading, refetch } = useTagValues(tagType);
    const { deleteTag } = useTagApi();
    const { setToastData, setToastApiError } = useToast();
    const trackOpenTagValueEditor = useTracking(openTagValueEditorTracking);
    const [action, setAction] = useState<RowAction | null>(null);
    const editingValue = action?.status === 'editing' ? action.value : null;
    const deleting = action?.status === 'deleting' ? action.tagValue : null;
    // Tanstack breaks ties by row index, in both directions, so presorting
    // by value keeps tied values in ascending order whichever way usage sorts.
    const data = useMemo(() => [...tagValues].sort(compareValues), [tagValues]);

    const refetchUsage = useCallback(() => {
        refetch();
        refetchTagTypes();
    }, [refetch]);

    const stopEditing = useCallback(
        () =>
            setAction((current) =>
                current?.status === 'editing' ? null : current,
            ),
        [],
    );

    const columns = useMemo<ColumnDef<TagValuesUsageSchemaTagValuesItem>[]>(
        () => [
            {
                id: 'value',
                header: 'Value',
                accessorKey: 'value',
                cell: ({ row: { original } }) => (
                    <TagValueCell
                        tagType={tagType}
                        tagValue={original}
                        editing={editingValue === original.value}
                        onEdit={() => {
                            trackOpenTagValueEditor('succeeded');
                            setAction({
                                status: 'editing',
                                value: original.value,
                            });
                        }}
                        onClose={stopEditing}
                        onRenamed={() => {
                            refetchUsage();
                            stopEditing();
                        }}
                    />
                ),
                sortingFn: (a, b) => compareValues(a.original, b.original),
            },
            {
                id: 'usedIn',
                header: 'Used in',
                accessorKey: 'usedInActiveFeatures',
                cell: ({ row }) => <TagValueUsageCell {...row.original} />,
                meta: { width: 140 },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row: { original } }) => (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <PermissionIconButton
                            permission={UPDATE_FEATURE}
                            tooltipProps={{ title: 'Delete tag value' }}
                            onClick={() =>
                                setAction({
                                    status: 'deleting',
                                    tagValue: original,
                                })
                            }
                        >
                            <Delete />
                        </PermissionIconButton>
                    </Box>
                ),
                enableSorting: false,
                meta: { width: 80, align: 'center' },
            },
        ],
        [
            tagType,
            editingValue,
            trackOpenTagValueEditor,
            stopEditing,
            refetchUsage,
        ],
    );

    const confirmDelete = async () => {
        if (!deleting) return;
        await deleteTag(tagType, deleting.value);
        refetchUsage();
        setAction(null);
        setToastData({ type: 'success', text: 'Tag value deleted' });
    };

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
            <DeleteTagValueDialog
                tagType={tagType}
                tagValue={deleting}
                onSubmit={confirmDelete}
                onError={(error) => setToastApiError(formatUnknownError(error))}
                onClose={() => setAction(null)}
            />
        </StyledSection>
    );
};

export const TagValuesTable = memo(TagValuesTableComponent);
