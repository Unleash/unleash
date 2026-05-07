import { useMemo, useRef } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { VirtualizedTableV8 } from 'component/common/Table/VirtualizedTable/VirtualizedTableV8';
import { sortingFns } from 'utils/sortingFns';
import type { AdvancedPlaygroundEnvironmentFeatureSchema } from 'openapi';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import type { IFeatureVariant } from 'interfaces/featureToggle';
import { useConditionallyHiddenColumnsV8 } from 'hooks/useConditionallyHiddenColumnsV8';
import { FeatureStatusCell } from '../PlaygroundResultsTable/FeatureStatusCell/FeatureStatusCell.tsx';
import { FeatureResultInfoPopoverCell } from '../PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureResultInfoPopoverCell.tsx';
import { VariantCell } from '../PlaygroundResultsTable/VariantCell/VariantCell.tsx';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell.tsx';
import { capitalizeFirst } from 'utils/capitalizeFirst';

interface IPlaygroundEnvironmentTableProps {
    features: AdvancedPlaygroundEnvironmentFeatureSchema[];
}

export const PlaygroundEnvironmentTable = ({
    features,
}: IPlaygroundEnvironmentTableProps) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const columnHelper =
        createColumnHelper<AdvancedPlaygroundEnvironmentFeatureSchema>();

    const columns = useMemo(() => {
        const dynamicHeaders = Object.keys(features[0].context).map(
            (contextField) =>
                columnHelper.accessor((row) => row.context?.[contextField], {
                    id: `context_${contextField}`,
                    header: capitalizeFirst(contextField),
                    cell: ({ getValue }) => (
                        <HighlightCell value={String(getValue() ?? '')} />
                    ),
                    meta: { minWidth: 160 },
                }),
        );

        return [
            ...dynamicHeaders,
            columnHelper.accessor((row) => row.variant?.name ?? '', {
                id: 'variant',
                header: 'Variant',
                sortingFn: 'alphanumeric',
                cell: ({
                    getValue,
                    row: {
                        original: { variant, name, variants, isEnabled },
                    },
                }) => (
                    <VariantCell
                        variant={variant?.enabled ? String(getValue()) : ''}
                        // schema/interface mismatch predates this migration
                        variants={variants as IFeatureVariant[]}
                        feature={name}
                        isEnabled={isEnabled}
                    />
                ),
                meta: { maxWidth: 200 },
            }),
            columnHelper.accessor(
                (row) =>
                    row?.isEnabled
                        ? 'true'
                        : row?.strategies?.result === 'unknown'
                          ? 'unknown'
                          : 'false',
                {
                    id: 'isEnabled',
                    header: 'isEnabled',
                    cell: ({ row }) => (
                        <FeatureStatusCell feature={row.original} />
                    ),
                    sortingFn: sortingFns.playgroundResultState,
                    sortDescFirst: true,
                    meta: { maxWidth: 120 },
                },
            ),
            columnHelper.display({
                id: 'info',
                header: '',
                cell: ({ row }) => (
                    <FeatureResultInfoPopoverCell
                        feature={row.original}
                        input={{
                            environment: row.original.environment,
                            context: row.original.context,
                        }}
                    />
                ),
                meta: { maxWidth: 70 },
            }),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const table = useReactTable({
        columns,
        data: features,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetAll: false,
        enableSortingRemoval: false,
        enableMultiSort: false,
    });

    useConditionallyHiddenColumnsV8(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['variant'],
            },
        ],
        table.setColumnVisibility,
        columns,
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
            <VirtualizedTableV8 parentRef={parentRef} tableInstance={table} />
        </Box>
    );
};
