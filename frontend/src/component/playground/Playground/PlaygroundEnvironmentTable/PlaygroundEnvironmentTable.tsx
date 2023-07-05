import React, { useMemo, useRef } from 'react';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';

import { VirtualizedTable } from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import {
    AdvancedPlaygroundEnvironmentFeatureSchema,
    PlaygroundFeatureSchema,
} from 'openapi';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { FeatureStatusCell } from '../PlaygroundResultsTable/FeatureStatusCell/FeatureStatusCell';
import { FeatureResultInfoPopoverCell } from '../PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureResultInfoPopoverCell';
import { VariantCell } from '../PlaygroundResultsTable/VariantCell/VariantCell';
import { HighlightCell } from '../../../common/Table/cells/HighlightCell/HighlightCell';
import { capitalizeFirst } from 'utils/capitalizeFirst';

interface IPlaygroundEnvironmentTableProps {
    features: AdvancedPlaygroundEnvironmentFeatureSchema[];
}

export const PlaygroundEnvironmentTable = ({
    features,
}: IPlaygroundEnvironmentTableProps) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const dynamicHeaders = Object.keys(features[0].context).map(
        contextField => ({
            Header: capitalizeFirst(contextField),
            accessor: `context.${contextField}`,
            minWidth: 160,
            Cell: HighlightCell,
        })
    );

    const COLUMNS = useMemo(() => {
        return [
            ...dynamicHeaders,
            {
                Header: 'Variant',
                id: 'variant',
                accessor: 'variant.name',
                sortType: 'alphanumeric',
                filterName: 'variant',
                maxWidth: 200,
                Cell: ({
                    value,
                    row: {
                        original: { variant, feature, variants, isEnabled },
                    },
                }: any) => (
                    <VariantCell
                        variant={variant?.enabled ? value : ''}
                        variants={variants}
                        feature={feature}
                        isEnabled={isEnabled}
                    />
                ),
            },
            {
                id: 'isEnabled',
                Header: 'isEnabled',
                filterName: 'isEnabled',
                accessor: (row: PlaygroundFeatureSchema) =>
                    row?.isEnabled
                        ? 'true'
                        : row?.strategies?.result === 'unknown'
                        ? 'unknown'
                        : 'false',
                Cell: ({ row }: any) => (
                    <FeatureStatusCell feature={row.original} />
                ),
                sortType: 'playgroundResultState',
                maxWidth: 120,
                sortInverted: true,
            },
            {
                Header: '',
                maxWidth: 70,
                id: 'info',
                Cell: ({ row }: any) => (
                    <FeatureResultInfoPopoverCell
                        feature={row.original}
                        input={{
                            environment: row.original.environment,
                            context: row.original.context,
                        }}
                    />
                ),
            },
        ];
    }, []);

    const { headerGroups, rows, prepareRow, setHiddenColumns } = useTable(
        {
            columns: COLUMNS as any,
            data: features,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useGlobalFilter,
        useFlexLayout,
        useSortBy
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['variant'],
            },
        ],
        setHiddenColumns,
        COLUMNS
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
