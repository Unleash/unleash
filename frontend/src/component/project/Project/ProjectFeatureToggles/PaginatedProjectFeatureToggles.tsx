import React, {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useState,
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
import { createFeatureToggleCell } from './FeatureToggleSwitch/createFeatureToggleCell';
import { useFeatureToggleSwitch } from './FeatureToggleSwitch/useFeatureToggleSwitch';
import useLoading from 'hooks/useLoading';
import { StickyPaginationBar } from '../../../common/Table/StickyPaginationBar/StickyPaginationBar';
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
import { FeatureSchema } from 'openapi';
import { ProjectFeatureTogglesHeader } from './ProjectFeatureTogglesHeader/ProjectFeatureTogglesHeader';

const StyledResponsiveButton = styled(ResponsiveButton)(() => ({
    whiteSpace: 'nowrap',
}));

interface IPaginatedProjectFeatureTogglesProps {
    environments: IProject['environments'];
    style?: CSSProperties;
    refreshInterval?: number;
    storageKey?: string;
}

const staticColumns = ['Select', 'Actions', 'name', 'favorite'];
const columnHelper = createColumnHelper<FeatureSchema>();

export const PaginatedProjectFeatureToggles = ({
    environments,
    style,
    refreshInterval = 15 * 1000,
    storageKey = 'project-feature-toggles',
}: IPaginatedProjectFeatureTogglesProps) => {
    const projectId = useRequiredPathParam('projectId');
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

    const data = useMemo(() => features, [features]);

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Name',
                // cell: (cell) => <FeatureNameCell value={cell.row} />,
                cell: ({ row }) => (
                    <LinkCell
                        title={row.original.name}
                        subtitle={row.original.description || undefined}
                        to={`/projects/${row.original.project}/features/${row.original.name}`}
                    />
                ),
            }),
        ],
        [tableState.favoritesFirst],
    );

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
        }),
    );

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
                        <PaginatedTable
                            tableInstance={table}
                            totalItems={total}
                        />
                    </SearchHighlightProvider>
                </div>
            </PageContent>
        </>
    );
};
