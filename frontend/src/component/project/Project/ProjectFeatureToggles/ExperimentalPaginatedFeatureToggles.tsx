import React, {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useState,
    FC,
    ReactNode,
    VFC,
} from 'react';
import {
    Checkbox,
    IconButton,
    styled,
    Tooltip,
    useMediaQuery,
    Box,
    useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    useFlexLayout,
    usePagination,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { IProject } from 'interfaces/project';
import {
    PaginatedTable,
    TableCell,
    TablePlaceholder,
    VirtualizedTable,
} from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { getColumnValues, includesFilter, useSearch } from 'hooks/useSearch';
import { Search } from 'component/common/Search/Search';
import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import { FavoriteIconHeader } from 'component/common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from 'component/common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { ProjectEnvironmentType } from './hooks/useEnvironmentsRef';
import { ActionsCell } from './ActionsCell/ActionsCell';
import { ColumnsMenu } from './ColumnsMenu/ColumnsMenu';
import { useStyles } from './ProjectFeatureToggles.styles';
import { useFavoriteFeaturesApi } from 'hooks/api/actions/useFavoriteFeaturesApi/useFavoriteFeaturesApi';
import { FeatureTagCell } from 'component/common/Table/cells/FeatureTagCell/FeatureTagCell';
import FileDownload from '@mui/icons-material/FileDownload';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ExportDialog } from 'component/feature/FeatureToggleList/ExportDialog';
import { MemoizedRowSelectCell } from './RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from 'component/common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ProjectFeaturesBatchActions } from './ProjectFeaturesBatchActions/ProjectFeaturesBatchActions';
import { MemoizedFeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { ListItemType } from './ProjectFeatureToggles.types';
import {
    MemoizedFeatureToggleCell,
    createFeatureToggleCell,
} from './FeatureToggleSwitch/createFeatureToggleCell';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import mapValues from 'lodash.mapvalues';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { BooleansStringParam } from 'utils/serializeQueryParams';
import {
    NumberParam,
    StringParam,
    ArrayParam,
    withDefault,
} from 'use-query-params';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import { FeatureSchema, FeatureSearchResponseSchema } from 'openapi';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';
import { TableBody, TableRow, TableHead } from '@mui/material';
import { Table } from 'component/common/Table/Table/Table';
import {
    Header,
    type Table as TableType,
    flexRender,
} from '@tanstack/react-table';
import { StickyPaginationBar } from 'component/common/Table/StickyPaginationBar/StickyPaginationBar';
import { CellSortable } from 'component/common/Table/SortableTableHeader/CellSortable/CellSortable';

interface IExperimentalPaginatedFeatureTogglesProps {
    environments: IProject['environments'];
    style?: CSSProperties;
    refreshInterval?: number;
    storageKey?: string;
}

const staticColumns = ['Select', 'Actions', 'name', 'favorite'];

type ColumnProps = {
    id: string;
    header: ReactNode;
    isSortable?: boolean;
    align?: 'left' | 'right' | 'center';
};

type ColumnType<T> = ColumnProps & {
    cell: (row: T) => JSX.Element;
};

const HeaderCell: VFC<{
    column: ColumnProps;
    tableState: {
        sortBy: string;
        sortOrder: string;
    };
    setTableState: (state: {
        sortBy: string;
        sortOrder: string;
    }) => void;
}> = ({ column, tableState, setTableState }) => (
    <CellSortable
        key={column.id}
        isSortable={column.isSortable}
        isSorted={tableState.sortBy === column.id}
        isDescending={tableState.sortOrder === 'desc'}
        align={column.align}
        onClick={() => {
            if (column.isSortable) {
                setTableState({
                    sortBy: column.id,
                    sortOrder: tableState.sortOrder === 'desc' ? 'asc' : 'desc',
                });
            }
        }}
        styles={{ borderRadius: '0px' }}
    >
        {column.header}
    </CellSortable>
);

export const ExperimentalPaginatedFeatureToggles = ({
    environments,
    style,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles',
}: IExperimentalPaginatedFeatureTogglesProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        {
            offset: withDefault(NumberParam, 0),
            limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
            query: StringParam,
            favoritesFirst: withDefault(BooleansStringParam, true),
            sortBy: withDefault(StringParam, 'createdAt'),
            sortOrder: withDefault(StringParam, 'desc'),
            columns: ArrayParam,
        },
    );

    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues({ ...tableState, projectId }, (value) =>
            value ? `${value}` : undefined,
        ),
        {
            refreshInterval,
        },
    );
    const bodyLoadingRef = useLoading(loading);

    const data = useMemo(
        () =>
            features.map((feature) => ({
                ...feature,
                archivedAt: feature.archivedAt || undefined,
                createdAt: feature.createdAt || '',
                lastSeenAt: feature.lastSeenAt || undefined,
                type: feature.type || '',

                environments: Object.fromEntries(
                    environments.map((env) => {
                        const thisEnv = feature?.environments?.find(
                            (featureEnvironment) =>
                                featureEnvironment?.name === env.environment,
                        );
                        return [
                            env,
                            {
                                name: env,
                                enabled: thisEnv?.enabled || false,
                                variantCount: thisEnv?.variantCount || 0,
                                lastSeenAt: thisEnv?.lastSeenAt,
                                type: thisEnv?.type,
                                hasStrategies: thisEnv?.hasStrategies,
                                hasEnabledStrategies:
                                    thisEnv?.hasEnabledStrategies,
                            },
                        ];
                    }),
                ),
                someEnabledEnvironmentHasVariants:
                    feature.environments?.some(
                        (featureEnvironment) =>
                            featureEnvironment.variantCount &&
                            featureEnvironment.variantCount > 0 &&
                            featureEnvironment.enabled,
                    ) || false,
            })),
        [features, environments],
    );

    type DataItem = (typeof data)[number];

    const columns: ColumnType<DataItem>[] = [
        {
            id: 'name',
            header: 'Name',
            cell: (row) => (
                <LinkCell
                    title={row.name}
                    subtitle={row.description}
                    to={`/projects/${row.project}/features/${row.name}`}
                />
            ),
            isSortable: true,
        },
        {
            id: 'type',
            header: 'Type',
            cell: (row) => <FeatureTypeCell value={row.type} />,
            align: 'center',
            isSortable: true,
        },
        ...environments.map(
            (environment) =>
                ({
                    id: environment.environment,
                    header: environment.environment,
                    cell: (row: DataItem) => (
                        <MemoizedFeatureToggleCell
                            value={
                                row.environments?.[environment.environment]
                                    ?.enabled || false
                            }
                            feature={row}
                            projectId={projectId}
                            environmentName={environment.environment}
                            isChangeRequestEnabled={isChangeRequestConfigured(
                                environment.environment,
                            )}
                            refetch={refetch}
                            // onFeatureToggleSwitch={onFeatureToggleSwitch}
                            onFeatureToggleSwitch={() => {}}
                        />
                    ),
                    align: 'center',
                    isSortable: true,
                }) as const,
        ),
    ];

    return (
        <>
            <PageContent
                disableLoading
                disablePadding
                header={
                    <ProjectFeatureTogglesHeader
                        totalItems={total}
                        searchQuery={tableState.query || ''}
                        onChangeSearchQuery={(query) =>
                            setTableState({ query })
                        }
                        isLoading={initialLoad}
                        dataToExport={features} // FIXME: selected columns?
                        environmentsToExport={environments.map(
                            ({ environment }) => environment, // FIXME: visible env columns?
                        )}
                    />
                }
            >
                <div
                    ref={bodyLoadingRef}
                    aria-busy={loading}
                    aria-live='polite'
                >
                    <SearchHighlightProvider value={tableState.query || ''}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <HeaderCell
                                            column={column}
                                            tableState={tableState}
                                            setTableState={setTableState}
                                            key={column.id}
                                        />
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody
                                role='rowgroup'
                                sx={{
                                    '& tr': {
                                        '&:hover': {
                                            '.show-row-hover': {
                                                opacity: 1,
                                            },
                                        },
                                    },
                                }}
                            >
                                {data.map((feature) => (
                                    <TableRow key={feature.name}>
                                        {columns.map((column) => (
                                            <TableCell key={column.id}>
                                                {column.cell(feature)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <ConditionallyRender
                            condition={data.length > 0}
                            show={
                                <StickyPaginationBar
                                    totalItems={total}
                                    pageIndex={
                                        tableState.offset / tableState.limit
                                    }
                                    pageSize={tableState.limit}
                                    fetchNextPage={() =>
                                        setTableState({
                                            offset:
                                                tableState.offset +
                                                tableState.limit,
                                        })
                                    }
                                    fetchPrevPage={() =>
                                        setTableState({
                                            offset:
                                                tableState.offset -
                                                tableState.limit,
                                        })
                                    }
                                    setPageLimit={(pageSize) =>
                                        setTableState({
                                            offset: 0,
                                            limit: pageSize,
                                        })
                                    }
                                />
                            }
                        />
                    </SearchHighlightProvider>
                </div>
            </PageContent>
        </>
    );
};
