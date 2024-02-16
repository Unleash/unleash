import { useMemo } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { Box, useMediaQuery } from '@mui/material';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
import theme from 'themes/theme';
import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import useLoading from 'hooks/useLoading';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ProjectApplicationSchema } from '../../../openapi';
import mapValues from 'lodash.mapvalues';
import {
    useProjectApplications,
    DEFAULT_PAGE_LIMIT,
} from 'hooks/api/getters/useProjectApplications/useProjectApplications';
import { StringArrayCell } from 'component/common/Table/cells/StringArrayCell';
import { SdkCell } from './SdkCell';

const columnHelper = createColumnHelper<ProjectApplicationSchema>();

export const ProjectApplications = () => {
    const projectId = useRequiredPathParam('projectId');

    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
    };
    const [tableState, setTableState] = usePersistentTableState(
        `project-applications-table-${projectId}`,
        stateConfig,
    );

    const {
        applications = [],
        total,
        loading,
        refetch: refetchApplications,
    } = useProjectApplications(
        projectId,
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );

    const setSearchValue = (query = '') => {
        setTableState({ query });
    };

    const bodyLoadingRef = useLoading(loading);

    const { offset, limit, query, sortBy, sortOrder, ...filterState } =
        tableState;

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => (
                    <LinkCell
                        title={row.original.name}
                        to={`/applications/${row.original.name}`}
                    />
                ),
                meta: {
                    width: '25%',
                },
            }),
            columnHelper.accessor('environments', {
                header: 'Environments',
                cell: ({ row }) => (
                    <StringArrayCell
                        row={row.original}
                        field={'environments'}
                        singularLabel={'environment'}
                    />
                ),
                meta: {
                    width: '25%',
                },
            }),
            columnHelper.accessor('instances', {
                header: 'Instances',
                cell: ({ row }) => (
                    <StringArrayCell
                        row={row.original}
                        field={'environments'}
                        singularLabel={'environment'}
                    />
                ),
                meta: {
                    width: '25%',
                },
            }),
            columnHelper.accessor('sdks', {
                header: 'SDK',
                cell: SdkCell,
                meta: {
                    width: '25%',
                },
            }),
        ],
        [],
    );

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data: applications,
        }),
    );

    const rows = table.getRowModel().rows;

    return (
        <PageContent
            disableLoading={true}
            bodyClass='no-padding'
            header={
                <PageHeader
                    title='Project applications'
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
                                    No applications found matching &ldquo;
                                    {query}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    No applications found matching your
                                    criteria.
                                </TablePlaceholder>
                            }
                        />
                    </Box>
                }
            />
        </PageContent>
    );
};
