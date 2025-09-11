import { useMemo } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PaginatedTable } from 'component/common/Table';
import { createColumnHelper, useReactTable } from '@tanstack/react-table';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ChangeRequestStatusCell } from 'component/changeRequest/ProjectChangeRequests/ChangeRequestsTabs/ChangeRequestStatusCell';
import { AvatarCell } from 'component/changeRequest/ProjectChangeRequests/ChangeRequestsTabs/AvatarCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { GlobalChangeRequestTitleCell } from './GlobalChangeRequestTitleCell.js';
import { FeaturesCell } from '../ProjectChangeRequests/ChangeRequestsTabs/FeaturesCell.js';
import { useUiFlag } from 'hooks/useUiFlag.js';
import { withTableState } from 'utils/withTableState';
import { 
    useChangeRequestsWithMockData as useChangeRequests, 
    type ChangeRequestItem 
} from 'hooks/api/getters/useChangeRequests/useChangeRequests';
import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
    useQueryParams,
} from 'use-query-params';
import mapValues from 'lodash.mapvalues';
import useLoading from 'hooks/useLoading';
import { styles as themeStyles } from 'component/common';

const DEFAULT_PAGE_LIMIT = 25;
const columnHelper = createColumnHelper<ChangeRequestItem>();

const ChangeRequestsInner = () => {
    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
    };
    
    const [tableState, setTableState] = useQueryParams(
        stateConfig,
        { updateType: 'replaceIn' },
    );

    const {
        changeRequests: data,
        total,
        loading,
        initialLoad,
    } = useChangeRequests(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );

    const columns = useMemo(
        () => [
            columnHelper.accessor('title', {
                id: 'Title',
                header: 'Title',
                meta: { width: '300px' },
                cell: ({ getValue, row }) => (
                    <GlobalChangeRequestTitleCell 
                        value={getValue()} 
                        row={row}
                    />
                ),
            }),
            columnHelper.accessor('features', {
                id: 'Updated feature flags',
                header: 'Updated feature flags',
                enableSorting: false,
                cell: ({
                    getValue,
                    row: {
                        original: { title, project },
                    },
                }) => {
                    const features = getValue();
                    // Convert string array to object array for FeaturesCell compatibility
                    const featureObjects = features.map((name: string) => ({ name }));
                    return (
                        <FeaturesCell 
                            project={project} 
                            value={featureObjects} 
                            key={title} 
                        />
                    );
                },
            }),
            columnHelper.accessor('createdBy', {
                id: 'By',
                header: 'By',
                meta: { width: '180px', align: 'left' },
                enableSorting: false,
                cell: ({ getValue }) => (
                    <AvatarCell value={getValue()} />
                ),
            }),
            columnHelper.accessor('createdAt', {
                id: 'Submitted',
                header: 'Submitted',
                meta: { width: '100px' },
                cell: ({ getValue }) => (
                    <TimeAgoCell value={getValue()} />
                ),
            }),
            columnHelper.accessor('environment', {
                id: 'Environment',
                header: 'Environment',
                meta: { width: '100px' },
                cell: ({ getValue }) => (
                    <HighlightCell value={getValue()} />
                ),
            }),
            columnHelper.accessor('state', {
                id: 'Status',
                header: 'Status',
                meta: { width: '170px' },
                cell: ({ getValue, row }) => (
                    <ChangeRequestStatusCell value={getValue()} row={row} />
                ),
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

    const bodyLoadingRef = useLoading(loading);

    return (
        <PageContent
            bodyClass='no-padding'
            header={<PageHeader title='Change requests' />}
        >
            <div className={themeStyles.fullwidth}>
                <div ref={bodyLoadingRef}>
                    <PaginatedTable tableInstance={table} totalItems={total} />
                </div>
            </div>
        </PageContent>
    );
};

export const ChangeRequests = () => {
    if (!useUiFlag('globalChangeRequestList')) {
        return (
            <PageContent header={<PageHeader title='Change requests' />}>
                <p>Nothing to see here. Move along.</p>
            </PageContent>
        );
    }

    return <ChangeRequestsInner />;
};