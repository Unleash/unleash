import { useMemo, useRef } from 'react';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';

import { VirtualizedTable } from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import type { AdvancedPlaygroundFeatureSchemaEnvironments } from 'openapi';
import { Box } from '@mui/material';
import { FeatureStatusCell } from '../PlaygroundResultsTable/FeatureStatusCell/FeatureStatusCell.tsx';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell.tsx';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { FeatureResultInfoPopoverCell } from '../PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureResultInfoPopoverCell.tsx';

interface IPlaygroundEnvironmentTableProps {
    features: AdvancedPlaygroundFeatureSchemaEnvironments;
}

export const PlaygroundEnvironmentDiffTable = ({
    features,
}: IPlaygroundEnvironmentTableProps) => {
    const environments = Object.keys(features);
    const firstEnvFeatures = features[environments[0]];
    const firstContext = firstEnvFeatures[0].context;

    const data = useMemo(
        () =>
            firstEnvFeatures.map((_item, index) => ({
                ...Object.fromEntries(
                    environments.map((env) => [env, features[env][index]]),
                ),
            })),
        [JSON.stringify(features)],
    );
    type RowType = (typeof data)[0];

    const contextFieldsHeaders = Object.keys(firstContext).map(
        (contextField) => ({
            Header: capitalizeFirst(contextField),
            accessor: (
                row: Record<string, { context: Record<string, unknown> }>,
            ) => row[environments[0]].context[contextField],
            minWidth: 160,
            Cell: HighlightCell,
        }),
    );

    const environmentHeaders = environments.map((environment) => ({
        Header: environment,
        accessor: (row: RowType) =>
            row[environment]?.isEnabled
                ? 'true'
                : row[environment]?.strategies?.result === 'unknown'
                  ? 'unknown'
                  : 'false',
        Cell: ({ row }: { row: { original: RowType } }) => {
            return (
                <Box sx={{ display: 'flex' }}>
                    <FeatureStatusCell feature={row.original[environment]} />
                    <FeatureResultInfoPopoverCell
                        feature={row.original[environment]}
                        input={{
                            environment: row.original[environment].environment,
                            context: row.original[environment].context,
                        }}
                    />
                </Box>
            );
        },
        sortType: 'playgroundResultState',
        maxWidth: 140,
    }));

    const COLUMNS = useMemo(() => {
        return [...contextFieldsHeaders, ...environmentHeaders];
    }, []);

    const { headerGroups, rows, prepareRow } = useTable(
        {
            columns: COLUMNS as any[],
            data,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useGlobalFilter,
        useFlexLayout,
        useSortBy,
    );

    const parentRef = useRef<HTMLElement | null>(null);

    return (
        <Box
            ref={parentRef}
            sx={{
                overflow: 'auto',
                maxHeight: '800px',
            }}
        >
            <VirtualizedTable
                parentRef={parentRef}
                rows={rows}
                headerGroups={headerGroups}
                prepareRow={prepareRow}
            />
        </Box>
    );
};
