import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
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
import { useTracking } from 'hooks/useTracking';
import {
    deleteTagTypeTracking,
    searchTagTypesTracking,
} from '../tagsTracking.ts';
import { useUiFlag } from 'hooks/useUiFlag';

type TagTypeRow = {
    name: string;
    description: string;
    color?: string;
    usedInProjects?: number;
    valueCount?: number;
};

type TagTypeToDelete = Pick<
    TagTypeRow,
    'name' | 'usedInProjects' | 'valueCount'
>;

// Only users with the root Viewer role are subject to private-project
// filtering, and Viewer can't delete tag types. Edge case: a Viewer whose
// group grants a custom root role with DELETE_TAG_TYPE still gets filtered,
// so usedInProjects may undercount for them.
const describeDeletionImpact = ({
    valueCount,
    usedInProjects,
}: Pick<TagTypeRow, 'usedInProjects' | 'valueCount'>) => {
    if (!valueCount) {
        return null;
    }
    const usage = usedInProjects ? (
        <>
            They are assigned to flags in{' '}
            <strong>
                {usedInProjects} {usedInProjects === 1 ? 'project' : 'projects'}
            </strong>
            , including archived flags.
        </>
    ) : (
        'None of them are assigned to flags.'
    );
    return (
        <>
            This will delete{' '}
            <strong>
                {valueCount} {valueCount === 1 ? 'tag value' : 'tag values'}
            </strong>
            . {usage} This can't be undone.
        </>
    );
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tagTypeToDelete, setTagTypeToDelete] = useState<TagTypeToDelete>();
    const [globalFilter, setGlobalFilter] = useState('');
    const navigate = useNavigate();
    const { deleteTagType } = useTagTypesApi();
    const { tagTypes, refetch, loading } = useTagTypes();
    const { setToastData, setToastApiError } = useToast();
    const trackSearchTagTypes = useTracking(searchTagTypesTracking);
    const tagManagementViaUi = useUiFlag('tagManagementViaUi');

    const data = useMemo<TagTypeRow[]>(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Tag type name',
                description: 'Tag type description when loading',
            });
        }

        return tagTypes.map(
            ({ name, description, color, usedInProjects, valueCount }) => ({
                name,
                description: description ?? '',
                color: color ?? undefined,
                usedInProjects,
                valueCount,
            }),
        );
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
                id: 'usedInProjects',
                header: 'Used in',
                accessorKey: 'usedInProjects',
                cell: ({ row: { original } }) =>
                    original.usedInProjects === undefined
                        ? null
                        : `${original.usedInProjects} ${original.usedInProjects === 1 ? 'project' : 'projects'}`,
                sortUndefined: 'last',
                enableGlobalFilter: false,
                meta: { align: 'center' },
            },
            {
                id: 'valueCount',
                header: 'Tag values',
                accessorKey: 'valueCount',
                sortUndefined: 'last',
                enableGlobalFilter: false,
                meta: { align: 'center' },
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
                            onClick={() => {
                                setTagTypeToDelete({
                                    name: original.name,
                                    usedInProjects: original.usedInProjects,
                                    valueCount: original.valueCount,
                                });
                                setDeleteDialogOpen(true);
                            }}
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
        }),
        [],
    );

    const columnVisibility = useMemo(
        () => ({
            description: false,
            usedInProjects: Boolean(tagManagementViaUi),
            valueCount: Boolean(tagManagementViaUi),
        }),
        [tagManagementViaUi],
    );

    const table = useReactTable({
        columns,
        data,
        initialState,
        state: { globalFilter, columnVisibility },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    const deleteTag = async () => {
        if (tagTypeToDelete) {
            await deleteTagType(tagTypeToDelete.name);
            refetch();
            setDeleteDialogOpen(false);
            setToastData({
                type: 'success',
                show: true,
                text: 'Tag type deleted',
            });
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
                                onChange={(value) => {
                                    setGlobalFilter(value);
                                    trackSearchTagTypes('succeeded', {
                                        queryLength: value.length,
                                    });
                                }}
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
                                    <TableCell
                                        key={cell.id}
                                        align={
                                            cell.column.columnDef.meta?.align
                                        }
                                    >
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
                open={deleteDialogOpen}
                onSubmit={deleteTag}
                onError={(error) => setToastApiError(formatUnknownError(error))}
                tracking={deleteTagTypeTracking}
                onClose={() => {
                    setDeleteDialogOpen(false);
                }}
            >
                {tagTypeToDelete
                    ? describeDeletionImpact(tagTypeToDelete)
                    : null}
            </Dialogue>
        </PageContent>
    );
};
