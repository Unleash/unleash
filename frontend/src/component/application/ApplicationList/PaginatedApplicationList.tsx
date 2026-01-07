import { useMemo } from 'react';
import { Avatar, Icon, Link, styled } from '@mui/material';
import { styles as themeStyles } from 'component/common';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import useApplications from 'hooks/api/getters/useApplications/useApplications';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PaginatedTable } from 'component/common/Table';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ApplicationUsageCell } from './ApplicationUsageCell/ApplicationUsageCell.tsx';
import type { ApplicationSchema } from 'openapi';
import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import { DEFAULT_PAGE_LIMIT } from 'hooks/api/getters/useProjectApplications/useProjectApplications';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { withTableState } from 'utils/withTableState';
import useLoading from 'hooks/useLoading';
import mapValues from 'lodash.mapvalues';

const InfoMessage = styled('div')(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(9, 0, 9, 0),
    minHeight: '150px',
}));

const renderNoResults = (query: string | null | undefined) => {
    if (typeof query === 'string' && query.length > 0) {
        return renderNoMatchingSearch(query);
    }
    return (
        <InfoMessage>
            You don't have have any connected applications. To connect your
            application to Unleash you will require a{' '}
            <Link href='https://docs.getunleash.io/docs/sdks/'>Client SDK</Link>
            .
            <br />
            You can read more about how to use Unleash in your application in
            the{' '}
            <Link href='https://docs.getunleash.io/docs/sdks/'>
                documentation.
            </Link>
        </InfoMessage>
    );
};

const renderNoMatchingSearch = (query: string) => (
    <InfoMessage>No application found matching "{query}"</InfoMessage>
);

const columnHelper = createColumnHelper<ApplicationSchema>();

export const PaginatedApplicationList = () => {
    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        sortBy: withDefault(StringParam, 'appName'),
        sortOrder: withDefault(StringParam, 'asc'),
    };
    const [tableState, setTableState] = usePersistentTableState(
        `applications-table`,
        stateConfig,
    );
    const {
        applications: data,
        total,
        loading,
    } = useApplications(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor('icon', {
                id: 'Icon',
                header: () => '',
                cell: ({
                    row: {
                        original: { icon },
                    },
                }: any) => (
                    <IconCell
                        icon={
                            <Avatar>
                                <Icon>{icon || 'apps'}</Icon>
                            </Avatar>
                        }
                    />
                ),
                enableSorting: false,
            }),
            columnHelper.accessor('appName', {
                header: 'Name',
                meta: { width: '50%' },
                cell: ({
                    row: {
                        original: { appName, description },
                    },
                }: any) => (
                    <LinkCell
                        title={appName}
                        to={`/applications/${encodeURIComponent(appName)}`}
                        subtitle={description}
                    />
                ),
            }),
            columnHelper.accessor('usage', {
                header: 'Project(environment)',
                meta: { width: '50%' },
                enableSorting: false,
                cell: ({
                    row: { original },
                }: {
                    row: { original: ApplicationSchema };
                }) => <ApplicationUsageCell usage={original.usage} />,
            }),
        ],
        [],
    );

    const table = useReactTable(
        withTableState(tableState, setTableState, {
            columns,
            data,
        }),
    );

    const { offset, limit, query, sortBy, sortOrder, ..._filterState } =
        tableState;

    const setSearchValue = (query = '') => {
        setTableState({ query });
    };

    const bodyLoadingRef = useLoading(loading);

    return (
        <>
            <PageContent
                bodyClass='no-padding'
                header={
                    <PageHeader
                        title={`Applications (${total})`}
                        actions={
                            <Search
                                initialValue={query || ''}
                                onChange={setSearchValue}
                            />
                        }
                    />
                }
            >
                <div className={themeStyles.fullwidth}>
                    <ConditionallyRender
                        condition={data.length > 0 || loading}
                        show={
                            <SearchHighlightProvider value={query || ''}>
                                <div ref={bodyLoadingRef}>
                                    <PaginatedTable
                                        tableInstance={table}
                                        totalItems={total}
                                    />
                                </div>
                            </SearchHighlightProvider>
                        }
                        elseShow={renderNoResults(query)}
                    />
                </div>
            </PageContent>
        </>
    );
};
