import { Add } from '@mui/icons-material';
import { Button, styled, useMediaQuery, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { calculateVariantWeight } from 'component/common/util';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useSearch } from 'hooks/useSearch';
import { IFeatureEnvironment, IFeatureVariant } from 'interfaces/featureToggle';
import { useEffect, useMemo } from 'react';
import { useFlexLayout, useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { PayloadOverridesCell } from './PayloadOverridesCell/PayloadOverridesCell';
import { VariantsActionCell } from './VariantsActionsCell/VariantsActionsCell';

const StyledTableContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(3, 0),
}));

interface IEnvironmentVariantsTableProps {
    environment: IFeatureEnvironment;
    searchValue: string;
    onAddVariant: () => void;
    onEditVariant: (variant: IFeatureVariant) => void;
    onDeleteVariant: (variant: IFeatureVariant) => void;
}

export const EnvironmentVariantsTable = ({
    environment,
    searchValue,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: IEnvironmentVariantsTableProps) => {
    const projectId = useRequiredPathParam('projectId');

    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'));

    const variants = environment.variants ?? [];

    if (variants.length === 0) {
        return null;
    }

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
                Header: 'Payload/Overrides',
                accessor: 'data',
                Cell: ({
                    row: {
                        original: { overrides, payload },
                    },
                }: any) => {
                    return (
                        <PayloadOverridesCell
                            overrides={overrides}
                            payload={payload}
                        />
                    );
                },
                disableSortBy: true,
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
                        editVariant={onEditVariant}
                        deleteVariant={onDeleteVariant}
                    />
                ),
                disableSortBy: true,
            },
        ],
        [projectId]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'name', desc: false }],
        }),
        []
    );

    const { data, getSearchText } = useSearch(columns, searchValue, variants);

    const {
        headerGroups,
        rows,
        prepareRow,
        state: { sortBy },
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[],
            data,
            initialState,
            sortTypes,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useSortBy,
        useFlexLayout
    );

    useEffect(() => {
        const hiddenColumns = [];
        if (isLargeScreen) {
            hiddenColumns.push('weightType');
        }
        if (isMediumScreen) {
            hiddenColumns.push('data');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isMediumScreen, isLargeScreen]);

    return (
        <>
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
            <Button onClick={onAddVariant} variant="text" startIcon={<Add />}>
                add variant
            </Button>
        </>
    );
};
