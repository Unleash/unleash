import { TableBody, TableRow, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Table, TableCell, TablePlaceholder } from 'component/common/Table';
import { SortableTableHeaderV8 } from 'component/common/Table/SortableTableHeader/SortableTableHeaderV8';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { calculateVariantWeight } from 'component/common/util';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearch } from 'hooks/useSearch';
import type {
    IFeatureVariant,
    IOverride,
    IPayload,
} from 'interfaces/featureToggle';
import { useMemo } from 'react';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { PayloadCell } from './PayloadCell/PayloadCell.tsx';
import { OverridesCell } from './OverridesCell/OverridesCell.tsx';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';

interface IEnvironmentVariantsTableProps {
    variants: IFeatureVariant[];
    searchValue?: string;
}

export const EnvironmentVariantsTable = ({
    variants,
    searchValue = '',
}: IEnvironmentVariantsTableProps) => {
    const projectId = useRequiredPathParam('projectId');

    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const columns = useMemo<ColumnDef<IFeatureVariant, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: HighlightCell,
                sortingFn: 'alphanumeric',
                meta: { minWidth: 350, searchable: true },
            },
            {
                id: 'payload',
                header: 'Payload',
                accessorKey: 'payload',
                cell: ({ getValue }) => (
                    <PayloadCell value={getValue() as IPayload} />
                ),
                enableSorting: false,
                meta: {
                    searchable: true,
                    filterParsing: (value: IPayload) => value?.value,
                },
            },
            {
                id: 'overrides',
                header: 'Overrides',
                accessorKey: 'overrides',
                cell: ({ getValue }) => (
                    <OverridesCell value={getValue() as IOverride[]} />
                ),
                enableSorting: false,
                meta: {
                    searchable: true,
                    filterParsing: (value: IOverride[]) =>
                        value
                            ?.map(
                                ({ contextName, values }) =>
                                    `${contextName}:${values.join()}`,
                            )
                            .join('\n') || '',
                },
            },
            {
                id: 'weight',
                header: 'Weight',
                accessorKey: 'weight',
                cell: ({
                    row: {
                        original: { name, weight },
                    },
                }) => (
                    <TextCell data-testid={`VARIANT_WEIGHT_${name}`}>
                        {calculateVariantWeight(weight)} %
                    </TextCell>
                ),
                sortingFn: 'basic',
            },
            {
                id: 'weightType',
                header: 'Type',
                accessorFn: (row) =>
                    row.weightType === 'fix' ? 'Fixed' : 'Variable',
                cell: TextCell,
                sortingFn: 'alphanumeric',
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [projectId, variants],
    );

    const initialState = useMemo(
        () => ({
            sorting: [{ id: 'name', desc: false }],
        }),
        [],
    );

    const { data, getSearchText } = useSearch(columns, searchValue, variants);

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

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isMediumScreen,
                columns: ['payload', 'overrides'],
            },
            {
                condition: isLargeScreen,
                columns: ['weightType'],
            },
        ],
        table.setColumnVisibility,
        columns,
    );

    const rows = table.getRowModel().rows;

    return (
        <>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <Table>
                    <SortableTableHeaderV8 tableInstance={table} />
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
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No variants found matching &ldquo;
                                {searchValue}
                                &rdquo;
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </>
    );
};
