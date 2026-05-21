import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Label from '@mui/icons-material/Label';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    DELETE_TAG_TYPE,
    UPDATE_TAG_TYPE,
} from 'component/providers/AccessProvider/permissions';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useTagTypesApi from 'hooks/api/actions/useTagTypesApi/useTagTypesApi';
import useTagTypes from 'hooks/api/getters/useTagTypes/useTagTypes';
import useToast from 'hooks/useToast';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { AddTagTypeButton } from './AddTagTypeButton/AddTagTypeButton.tsx';
import { Search } from 'component/common/Search/Search';

type TagTypeRow = {
    name: string;
    description: string;
    color?: string;
};

const StyledColorDot = styled('div')<{ $color: string }>(
    ({ theme, $color }) => ({
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: $color,
        marginRight: theme.spacing(0.2),
        marginLeft: theme.spacing(1.5),
        border:
            $color === '#FFFFFF'
                ? `1px solid ${theme.palette.divider}`
                : `1px solid ${$color}`,
    }),
);

export const TagTypeList = () => {
    const [deletion, setDeletion] = useState<{
        open: boolean;
        name?: string;
    }>({ open: false });
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const { deleteTagType } = useTagTypesApi();
    const { tagTypes, refetch, loading } = useTagTypes();
    const { setToastData, setToastApiError } = useToast();

    const data = useMemo<TagTypeRow[]>(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Tag type name',
                description: 'Tag type description when loading',
            });
        }

        return tagTypes.map(({ name, description, color }) => ({
            name,
            description: description ?? '',
            color: color ?? undefined,
        }));
    }, [tagTypes, loading]);

    const columns = useMemo<ColumnDef<TagTypeRow, unknown>[]>(
        () => [
            {
                id: 'Icon',
                cell: () => (
                    <Box
                        data-loading
                        sx={{
                            pl: 2,
                            pr: 1,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Label color='disabled' />
                    </Box>
                ),
                enableGlobalFilter: false,
            },
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({
                    row: {
                        original: { name, description, color },
                    },
                }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ConditionallyRender
                            condition={Boolean(color)}
                            show={
                                <StyledColorDot $color={color ?? '#FFFFFF'} />
                            }
                        />
                        <LinkCell
                            data-loading
                            title={name}
                            subtitle={description}
                        />
                    </Box>
                ),
                sortingFn: 'alphanumeric',
                meta: { width: '90%' },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original } }) => (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        data-loading
                    >
                        <PermissionIconButton
                            onClick={() =>
                                navigate(`/tag-types/edit/${original.name}`)
                            }
                            permission={UPDATE_TAG_TYPE}
                            tooltipProps={{ title: 'Edit tag type' }}
                        >
                            <Edit />
                        </PermissionIconButton>
                        <PermissionIconButton
                            permission={DELETE_TAG_TYPE}
                            tooltipProps={{ title: 'Delete tag type' }}
                            onClick={() =>
                                setDeletion({
                                    open: true,
                                    name: original.name,
                                })
                            }
                        >
                            <Delete />
                        </PermissionIconButton>
                    </Box>
                ),
                enableSorting: false,
                enableGlobalFilter: false,
                meta: { width: 150, align: 'center' },
            },
            {
                id: 'description',
                accessorKey: 'description',
                enableSorting: false,
            },
        ],
        [navigate],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'name', desc: false }],
            columnVisibility: { description: false },
        }),
        [],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const deleteTag = async () => {
        try {
            if (deletion.name) {
                await deleteTagType(deletion.name);
                refetch();
                setDeletion({ open: false });
                setToastData({
                    type: 'success',
                    show: true,
                    text: 'Tag type deleted',
                });
            }
        } catch (error) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const rows = table.getRowModel().rows;

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`Tag types (${rows.length})`}
                    actions={
                        <>
                            <Search
                                initialValue={globalFilter}
                                onChange={(value) => setGlobalFilter(value)}
                            />
                            <PageHeader.Divider />
                            <AddTagTypeButton />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Table>
                    <SortableTableHeader tableInstance={table} />
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow hover key={row.id}>
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
                </Table>
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No tags found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No tags available. Get started by adding one.
                            </TablePlaceholder>
                        }
                    />
                }
            />
            <Dialogue
                title='Really delete Tag type?'
                open={deletion.open}
                onClick={deleteTag}
                onClose={() => {
                    setDeletion({ open: false });
                }}
            />
        </PageContent>
    );
};
