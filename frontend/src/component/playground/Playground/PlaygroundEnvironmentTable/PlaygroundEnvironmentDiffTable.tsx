import { useMemo, useRef } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { VirtualizedTable } from 'component/common/Table/VirtualizedTable/VirtualizedTable';
import { sortingFns } from 'utils/sortingFns';
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

    const columnHelper = createColumnHelper<RowType>();

    const columns = useMemo(() => {
        const contextColumns = Object.keys(firstContext).map((contextField) =>
            columnHelper.accessor(
                (row) =>
                    (
                        row[environments[0]] as {
                            context: Record<string, unknown>;
                        }
                    ).context[contextField],
                {
                    id: `context_${contextField}`,
                    header: capitalizeFirst(contextField),
                    cell: ({ getValue }) => (
                        <HighlightCell value={String(getValue() ?? '')} />
                    ),
                    meta: { minWidth: 160 },
                },
            ),
        );

        const environmentColumns = environments.map((environment) =>
            columnHelper.accessor(
                (row) =>
                    row[environment]?.isEnabled
                        ? 'true'
                        : row[environment]?.strategies?.result === 'unknown'
                          ? 'unknown'
                          : 'false',
                {
                    id: environment,
                    header: environment,
                    cell: ({ row }) => (
                        <Box sx={{ display: 'flex' }}>
                            <FeatureStatusCell
                                feature={row.original[environment]}
                            />
                            <FeatureResultInfoPopoverCell
                                feature={row.original[environment]}
                                input={{
                                    environment:
                                        row.original[environment].environment,
                                    context: row.original[environment].context,
                                }}
                            />
                        </Box>
                    ),
                    sortingFn: sortingFns.playgroundResultState,
                    meta: { maxWidth: 140 },
                },
            ),
        );

        return [...contextColumns, ...environmentColumns];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    const parentRef = useRef<HTMLElement | null>(null);

    return (
        <Box
            ref={parentRef}
            sx={{
                overflow: 'auto',
                maxHeight: '800px',
            }}
        >
            <VirtualizedTable parentRef={parentRef} tableInstance={table} />
        </Box>
    );
};
