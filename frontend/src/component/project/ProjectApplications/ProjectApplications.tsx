
import { useMemo, useState } from 'react';
import useProjectApplicationsOld from '../../../hooks/api/getters/useProjectApplications/useProjectApplicationsOld';
import { useRequiredPathParam } from '../../../hooks/useRequiredPathParam';
import { PageContent } from '../../common/PageContent/PageContent';
import { PageHeader } from '../../common/PageHeader/PageHeader';
import { ConditionallyRender } from '../../common/ConditionallyRender/ConditionallyRender';
import { Search } from '../../common/Search/Search';
import { Box, Button, IconButton, Link, Tooltip, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { focusable } from '../../../themes/themeStyles';
import {
    FeatureToggleListActions
} from '../../feature/FeatureToggleList/FeatureToggleListActions/FeatureToggleListActions';
import { ReviewsOutlined } from '@mui/icons-material';
import { FeatureToggleFilters } from '../../feature/FeatureToggleList/FeatureToggleFilters/FeatureToggleFilters';
import { SearchHighlightProvider } from '../../common/Table/SearchHighlightContext/SearchHighlightContext';
import { PaginatedTable, TablePlaceholder } from '../../common/Table';
import { ExportDialog } from '../../feature/FeatureToggleList/ExportDialog';
import theme from 'themes/theme';
import { NumberParam, StringParam, withDefault } from 'use-query-params';
import { DEFAULT_PAGE_LIMIT } from '../../../hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { BooleansStringParam } from '../../../utils/serializeQueryParams';
import { usePersistentTableState } from '../../../hooks/usePersistentTableState';
import useLoading from '../../../hooks/useLoading';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from '../../../utils/withTableState';
import { FavoriteIconHeader } from '../../common/Table/FavoriteIconHeader/FavoriteIconHeader';
import { FavoriteIconCell } from '../../common/Table/cells/FavoriteIconCell/FavoriteIconCell';
import { FeatureEnvironmentSeenCell } from '../../common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import { FeatureTypeCell } from '../../common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { LinkCell } from '../../common/Table/cells/LinkCell/LinkCell';
import { FeatureSegmentCell } from '../../common/Table/cells/FeatureSegmentCell/FeatureSegmentCell';
import { FeatureTagCell } from '../../common/Table/cells/FeatureTagCell/FeatureTagCell';
import { DateCell } from '../../common/Table/cells/DateCell/DateCell';
import { FeatureStaleCell } from '../../feature/FeatureToggleList/FeatureStaleCell/FeatureStaleCell';
import { ProjectApplicationSchema } from '../../../openapi';

const columnHelper = createColumnHelper<ProjectApplicationSchema>();

export const ProjectApplications = () => {
    const projectId = useRequiredPathParam('projectId');
    const { applications, loading } = useProjectApplicationsOld(projectId);

    const [searchValue, setSearchValue] = useState('');
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const bodyLoadingRef = useLoading(loading);

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
    };
    const [tableState, setTableState] = usePersistentTableState(
        `project-applications-table-${projectId}`,
        stateConfig,
    );
    const {
        offset,
        limit,
        query,
        favoritesFirst,
        sortBy,
        sortOrder,
        ...filterState
    } = tableState;

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: () => <span>Last Name</span>,
                cell: info => info.getValue(),
                enableSorting: false,
                meta: {
                    width: '1%',
                },
            })
        ],
        [],
    );


    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data : applications,
        }),
    );

    return (
        <PageContent
            disableLoading={true}
            bodyClass='no-padding'
            header={
                <PageHeader
                    title='Search'
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <>
                                        <Search
                                            placeholder='Search'
                                            expandable
                                            initialValue={query || ''}
                                            onChange={setSearchValue}
                                            id='globalFeatureToggles'
                                        />
                                        <PageHeader.Divider />
                                    </>
                                }
                            />
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={query || ''}
                                onChange={setSearchValue}
                                id='globalFeatureToggles'
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <FeatureToggleFilters
                onChange={setTableState}
                state={filterState}
            />
            <SearchHighlightProvider value={query || ''}>
                <div ref={bodyLoadingRef}>
                    <PaginatedTable tableInstance={table} totalItems={total} />
                </div>
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <Box sx={(theme) => ({ padding: theme.spacing(0, 2, 2) })}>
                        <ConditionallyRender
                            condition={(query || '')?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No feature toggles found matching &ldquo;
                                    {query}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    No feature toggles found matching your
                                    criteria. Get started by adding a new
                                    feature toggle.
                                </TablePlaceholder>
                            }
                        />
                    </Box>
                }
            />
            <ConditionallyRender
                condition={Boolean(uiConfig?.flags?.featuresExportImport)}
                show={
                    <ExportDialog
                        showExportDialog={showExportDialog}
                        data={data}
                        onClose={() => setShowExportDialog(false)}
                        environments={enabledEnvironments}
                    />
                }
            />
        </PageContent>
    );
};
