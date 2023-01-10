import { styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { calculateVariantWeight } from 'component/common/util';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearch } from 'hooks/useSearch';
import {
    IFeatureEnvironment,
    IFeatureVariant,
    IOverride,
    IPayload,
} from 'interfaces/featureToggle';
import { useMemo } from 'react';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PayloadCell } from './PayloadCell/PayloadCell';
import { OverridesCell } from './OverridesCell/OverridesCell';
import { VariantsActionCell } from './VariantsActionsCell/VariantsActionsCell';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';

const StyledTableContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
}));

interface IEnvironmentVariantsTableProps {
    environment: IFeatureEnvironment;
    searchValue: string;
    onEditVariant: (variant: IFeatureVariant) => void;
    onDeleteVariant: (variant: IFeatureVariant) => void;
}

export const EnvironmentVariantsTable = ({
    environment,
    searchValue,
    onEditVariant,
    onDeleteVariant,
}: IEnvironmentVariantsTableProps) => {
    const projectId = useRequiredPathParam('projectId');

    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const variants = environment.variants ?? [];

    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: HighlightCell,
                sortType: 'alphanumeric',
                minWidth: 100,
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
                accessor: 'weightType',
                Cell: TextCell,
                sortType: 'alphanumeric',
            },
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                Cell: ({
                    row: { original },
                }: {
                    row: { original: IFeatureVariant };
                }) => (
                    <VariantsActionCell
                        variant={original}
                        projectId={projectId}
                        environmentId={environment.name}
                        editVariant={onEditVariant}
                        deleteVariant={onDeleteVariant}
                    />
                ),
                disableSortBy: true,
            },
        ],
        [projectId, variants, environment]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
        }),
        []
    );

    const { data, getSearchText } = useSearch(columns, searchValue, variants);

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
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
        useSortBy,
        useFlexLayout
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
        <StyledTableContainer>
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
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
        </StyledTableContainer>
    );
};
