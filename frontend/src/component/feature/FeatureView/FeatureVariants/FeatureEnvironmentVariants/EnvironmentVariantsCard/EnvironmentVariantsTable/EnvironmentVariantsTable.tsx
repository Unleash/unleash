import { TableBody, TableRow, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    SortableTableHeader,
    Table,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { calculateVariantWeight } from 'component/common/util';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearch } from 'hooks/useSearch';
import { IFeatureVariant, IOverride, IPayload } from 'interfaces/featureToggle';
import { useMemo } from 'react';
import { useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PayloadCell } from './PayloadCell/PayloadCell';
import { OverridesCell } from './OverridesCell/OverridesCell';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';

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

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: HighlightCell,
                sortType: 'alphanumeric',
                minWidth: 350,
                searchable: true,
            },
            {
                Header: 'Payload',
                accessor: 'payload',
                Cell: PayloadCell,
                disableSortBy: true,
                searchable: true,
                filterParsing: (value: IPayload) => value?.value,
            },
            {
                Header: 'Overrides',
                accessor: 'overrides',
                Cell: OverridesCell,
                disableSortBy: true,
                searchable: true,
                filterParsing: (value: IOverride[]) =>
                    value
                        ?.map(
                            ({ contextName, values }) =>
                                `${contextName}:${values.join()}`
                        )
                        .join('\n') || '',
            },
            {
                Header: 'Weight',
                accessor: 'weight',
                Cell: ({
                    row: {
                        original: { name, weight },
                    },
                }: any) => {
                    return (
                        <TextCell data-testid={`VARIANT_WEIGHT_${name}`}>
                            {calculateVariantWeight(weight)} %
                        </TextCell>
                    );
                },
                sortType: 'number',
            },
            {
                Header: 'Type',
                accessor: (row: any) =>
                    row.weightType === 'fix' ? 'Fixed' : 'Variable',
                Cell: TextCell,
                sortType: 'alphanumeric',
            },
        ],
        [projectId, variants]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
        }),
        []
    );

    const { data, getSearchText } = useSearch(columns, searchValue, variants);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy
    );

    useConditionallyHiddenColumns(
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
        setHiddenColumns,
        columns
    );

    return (
        <>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups as any} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <TableCell {...cell.getCellProps()}>
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
