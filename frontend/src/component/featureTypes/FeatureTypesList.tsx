import { useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { sortingFns } from 'utils/sortingFns';
import { PageContent } from 'component/common/PageContent/PageContent';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { Box } from '@mui/material';
import { Table, TableBody, TableCell, TableRow } from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { getFeatureTypeIcons } from 'utils/getFeatureTypeIcons';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import Edit from '@mui/icons-material/Edit';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { FeatureTypeEdit } from './FeatureTypeEdit/FeatureTypeEdit.tsx';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import type { FeatureTypeSchema } from 'openapi';

const basePath = '/feature-toggle-type';

export const FeatureTypesList = () => {
    const { featureTypes, loading } = useFeatureTypes();
    const navigate = useNavigate();

    const columns = useMemo<ColumnDef<FeatureTypeSchema, unknown>[]>(
        () => [
            {
                id: 'id',
                header: '',
                accessorKey: 'id',
                cell: ({ getValue }) => {
                    const value = String(getValue() ?? '');
                    const IconComponent = getFeatureTypeIcons(value);
                    return (
                        <IconCell
                            icon={
                                <IconComponent
                                    data-loading='true'
                                    color='action'
                                />
                            }
                        />
                    );
                },
                enableSorting: false,
                meta: { width: 50 },
            },
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({
                    row: {
                        original: { name, description },
                    },
                }) => (
                    <LinkCell
                        data-loading
                        title={name}
                        subtitle={description}
                    />
                ),
                sortingFn: 'alphanumeric',
                meta: { width: '90%' },
            },
            {
                id: 'lifetimeDays',
                header: 'Lifetime',
                accessorKey: 'lifetimeDays',
                cell: ({ getValue }) => {
                    const value = getValue() as number | undefined;
                    if (value) {
                        return (
                            <TextCell>
                                {value === 1 ? '1 day' : `${value} days`}
                            </TextCell>
                        );
                    }
                    return <TextCell>doesn't expire</TextCell>;
                },
                sortingFn: sortingFns.numericZeroLast,
                meta: { minWidth: 150 },
            },
            {
                id: 'Actions',
                header: 'Actions',
                cell: ({ row: { original: featureType } }) => (
                    <Box sx={(theme) => ({ padding: theme.spacing(0.5, 0) })}>
                        <ActionCell>
                            <PermissionIconButton
                                disabled={!featureType.id}
                                data-loading='true'
                                onClick={() =>
                                    navigate(
                                        `/feature-toggle-type/edit/${featureType.id}`,
                                    )
                                }
                                permission={ADMIN}
                                tooltipProps={{
                                    title: `Edit ${featureType.name} feature flag type`,
                                }}
                            >
                                <Edit />
                            </PermissionIconButton>
                        </ActionCell>
                    </Box>
                ),
                enableSorting: false,
            },
        ],
        [navigate],
    );

    const data = useMemo(
        () =>
            loading
                ? (Array(5).fill({
                      id: '',
                      name: 'Loading...',
                      description: 'Loading...',
                      lifetimeDays: 1,
                  }) as FeatureTypeSchema[])
                : featureTypes,
        [loading, featureTypes],
    );

    const table = useReactTable({
        columns,
        data,
        initialState: {
            sorting: [{ id: 'lifetimeDays', desc: false }],
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
    });

    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title='Feature flag types' />}
        >
            <Table>
                <SortableTableHeaderV8 tableInstance={table} />
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
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
            <Routes>
                <Route
                    path='edit/:featureTypeId'
                    element={
                        <SidebarModal
                            label='Edit feature flag type'
                            onClose={() => navigate(basePath)}
                            open
                        >
                            <FeatureTypeEdit
                                featureTypes={featureTypes}
                                loading={loading}
                            />
                        </SidebarModal>
                    }
                />
            </Routes>
        </PageContent>
    );
};
