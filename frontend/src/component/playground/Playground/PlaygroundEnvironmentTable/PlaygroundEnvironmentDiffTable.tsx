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
    AdvancedPlaygroundFeatureSchemaEnvironments,
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
    features: AdvancedPlaygroundFeatureSchemaEnvironments;
}

export const PlaygroundEnvironmentDiffTable = ({
    features,
}: IPlaygroundEnvironmentTableProps) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const environments = Object.keys(features);
    const firstEnvFeatures = features[environments[0]];

    const data = firstEnvFeatures.map((item, index) => ({
        context: item.context,
        ...environments.map(environment => ({
            environment,
            data: features[environment][index],
        })),
    }));

    const dynamicHeaders = Object.keys(context)
        .filter(contextField => contextField !== 'appName')
        .map(contextField => ({
            Header: capitalizeFirst(contextField),
            accessor: `context.${contextField}`,
            minWidth: 160,
            Cell: HighlightCell,
        }));

    const COLUMNS = useMemo(() => {
        return [
            ...dynamicHeaders,
            // {
            //     id: 'isEnabled',
            //     Header: 'isEnabled',
            //     filterName: 'isEnabled',
            //     accessor: (row: PlaygroundFeatureSchema) =>
            //         row?.isEnabled
            //             ? 'true'
            //             : row?.strategies?.result === 'unknown'
            //             ? 'unknown'
            //             : 'false',
            //     Cell: ({ row }: any) => (
            //         <FeatureStatusCell feature={row.original} />
            //     ),
            //     sortType: 'playgroundResultState',
            //     maxWidth: 120,
            //     sortInverted: true,
            // },
            // {
            //     Header: '',
            //     maxWidth: 70,
            //     id: 'info',
            //     Cell: ({ row }: any) => (
            //         <FeatureResultInfoPopoverCell
            //             feature={row.original}
            //             input={{
            //                 environment: row.original.environment,
            //                 context: row.original.context,
            //             }}
            //         />
            //     ),
            // },
        ];
    }, []);

    const {
        headerGroups,
        rows,
        state: { sortBy },
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: COLUMNS as any,
            data,
            sortTypes,
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
