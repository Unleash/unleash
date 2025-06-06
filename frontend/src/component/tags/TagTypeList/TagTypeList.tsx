import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
} from 'component/common/Table';
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
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { sortTypes } from 'utils/sortTypes';
import { AddTagTypeButton } from './AddTagTypeButton/AddTagTypeButton.tsx';
import { Search } from 'component/common/Search/Search';

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
    const navigate = useNavigate();
    const { deleteTagType } = useTagTypesApi();
    const { tagTypes, refetch, loading } = useTagTypes();
    const { setToastData, setToastApiError } = useToast();

    const data = useMemo(() => {
        if (loading) {
            return Array(5).fill({
                name: 'Tag type name',
                description: 'Tag type description when loading',
            });
        }

        return tagTypes.map(({ name, description, color }) => ({
            name,
            description,
            color,
        }));
    }, [tagTypes, loading]);

    const columns = useMemo(
        () => [
            {
                id: 'Icon',
                Cell: () => (
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
                disableGlobalFilter: true,
            },
            {
                Header: 'Name',
                accessor: 'name',
                width: '90%',
                Cell: ({
                    row: {
                        original: { name, description, color },
                    },
                }: any) => {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ConditionallyRender
                                condition={Boolean(color)}
                                show={<StyledColorDot $color={color} />}
                            />
                            <LinkCell
                                data-loading
                                title={name}
                                subtitle={description}
                            />
                        </Box>
                    );
                },
                sortType: 'alphanumeric',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({ row: { original } }: any) => (
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
                width: 150,
                disableGlobalFilter: true,
                disableSortBy: true,
            },
            {
                accessor: 'description',
                disableSortBy: true,
            },
        ],
        [navigate],
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
            hiddenColumns: ['description'],
        }),
        [],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy,
    );

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
                                onChange={setGlobalFilter}
                            />
                            <PageHeader.Divider />
                            <AddTagTypeButton />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            const { key, ...rowProps } = row.getRowProps();
                            return (
                                <TableRow hover key={key} {...rowProps}>
                                    {row.cells.map((cell) => {
                                        const { key, ...cellProps } =
                                            cell.getCellProps();
                                        return (
                                            <TableCell key={key} {...cellProps}>
                                                {cell.render('Cell')}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
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
