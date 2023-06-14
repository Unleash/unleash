import { useMemo } from 'react';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';

import { VirtualizedTable } from 'component/common/Table';
import { sortTypes } from 'utils/sortTypes';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { useMediaQuery, useTheme } from '@mui/material';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { FeatureStatusCell } from '../PlaygroundResultsTable/FeatureStatusCell/FeatureStatusCell';
import { FeatureResultInfoPopoverCell } from '../PlaygroundResultsTable/FeatureResultInfoPopoverCell/FeatureResultInfoPopoverCell';
import { VariantCell } from '../PlaygroundResultsTable/VariantCell/VariantCell';

interface IPlaygroundEnvironmentTableProps {
    features: PlaygroundFeatureSchema[];
    input: PlaygroundRequestSchema;
}

export const PlaygroundEnvironmentTable = ({
    features,
    input,
}: IPlaygroundEnvironmentTableProps) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const COLUMNS = useMemo(() => {
        return [
            {
                Header: 'Name',
                accessor: 'name',
                searchable: true,
                minWidth: 160,
                Cell: ({ value, row: { original } }: any) => (
                    <LinkCell
                        title={value}
                        to={`/projects/${original?.projectId}/features/${value}`}
                    />
                ),
            },
            {
                Header: 'Project ID',
                accessor: 'projectId',
                sortType: 'alphanumeric',
                filterName: 'projectId',
                searchable: true,
                maxWidth: 170,
                Cell: ({ value }: any) => (
                    <LinkCell title={value} to={`/projects/${value}`} />
                ),
            },
            {
                Header: 'Variant',
                id: 'variant',
                accessor: 'variant.name',
                sortType: 'alphanumeric',
                filterName: 'variant',
                searchable: true,
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
                        input={input}
                    />
                ),
            },
        ];
    }, [input]);

    const {
        headerGroups,
        rows,
        state: { sortBy },
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: features,
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
            {
                condition: isSmallScreen,
                columns: ['projectId'],
            },
        ],
        setHiddenColumns,
        COLUMNS
    );

    return (
        <VirtualizedTable
            rows={rows}
            headerGroups={headerGroups}
            prepareRow={prepareRow}
        />
    );
};
