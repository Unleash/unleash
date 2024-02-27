import { useMemo } from 'react';
import { Avatar, Icon, Link } from '@mui/material';
import { Warning } from '@mui/icons-material';
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
import { ApplicationUsageCell } from './ApplicationUsageCell/ApplicationUsageCell';
import { ApplicationSchema } from 'openapi';
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

const renderNoApplications = () => (
    <>
        <section style={{ textAlign: 'center' }}>
            <Warning titleAccess='Warning' /> <br />
            <br />
            Oh snap, it does not seem like you have connected any applications.
            To connect your application to Unleash you will require a Client
            SDK.
            <br />
            <br />
            You can read more about how to use Unleash in your application in
            the{' '}
            <Link href='https://docs.getunleash.io/docs/sdks/'>
                documentation.
            </Link>
        </section>
    </>
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
                        to={`/applications/${appName}`}
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

    const rows = table.getRowModel().rows;

    const { offset, limit, query, sortBy, sortOrder, ...filterState } =
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
                        elseShow={renderNoApplications()}
                    />
                </div>
            </PageContent>
        </>
    );
};
