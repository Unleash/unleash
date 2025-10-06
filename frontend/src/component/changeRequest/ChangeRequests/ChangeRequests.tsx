import { useId, useMemo } from 'react';
import { Box } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PaginatedTable, TablePlaceholder } from 'component/common/Table';
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
    useChangeRequestSearch,
    DEFAULT_PAGE_LIMIT,
    type SearchChangeRequestsInput,
} from 'hooks/api/getters/useChangeRequestSearch/useChangeRequestSearch';
import type { ChangeRequestSearchItemSchema } from 'openapi';
import {
    NumberParam,
    StringParam,
    withDefault,
    useQueryParams,
    encodeQueryParams,
} from 'use-query-params';
import useLoading from 'hooks/useLoading';
import { styles as themeStyles } from 'component/common';
import { FilterItemParam } from 'utils/serializeQueryParams';
import {
    ChangeRequestFilters,
    type ChangeRequestQuickFilter,
} from './ChangeRequestFilters.js';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser.js';

const columnHelper = createColumnHelper<ChangeRequestSearchItemSchema>();

const ChangeRequestsInner = () => {
    const { user } = useAuthUser();
    const urlParams = new URLSearchParams(window.location.search);
    const shouldApplyDefaults =
        user &&
        !urlParams.has('createdBy') &&
        !urlParams.has('requestedApproverId');
    const initialFilter = urlParams.has('requestedApproverId')
        ? 'Approval Requested'
        : 'Created';

    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        createdBy: FilterItemParam,
        requestedApproverId: FilterItemParam,
    };

    const initialState = shouldApplyDefaults
        ? {
              createdBy: {
                  operator: 'IS' as const,
                  values: [user.id.toString()],
              },
          }
        : {};

    const [tableState, setTableState] = useQueryParams(stateConfig, {
        updateType: 'replaceIn',
    });

    const effectiveTableState = useMemo(
        () => ({
            ...tableState,
            ...initialState,
        }),
        [initialState, tableState],
    );

    const {
        changeRequests: data,
        total,
        loading,
    } = useChangeRequestSearch(
        encodeQueryParams(
            stateConfig,
            effectiveTableState,
        ) as SearchChangeRequestsInput,
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
                    const featureObjects = features.map((name: string) => ({
                        name,
                    }));
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
                cell: ({ getValue }) => <AvatarCell value={getValue()} />,
            }),
            columnHelper.accessor('createdAt', {
                id: 'Submitted',
                header: 'Submitted',
                meta: { width: '100px' },
                cell: ({ getValue }) => <TimeAgoCell value={getValue()} />,
            }),
            columnHelper.accessor('environment', {
                id: 'Environment',
                header: 'Environment',
                meta: { width: '100px' },
                cell: ({ getValue }) => <HighlightCell value={getValue()} />,
            }),
            columnHelper.accessor('state', {
                id: 'Status',
                header: 'Status',
                meta: { width: '170px' },
                cell: ({ getValue, row }) => (
                    // @ts-expect-error (`globalChangeRequestList`) The schema (and query) needs to be updated
                    <ChangeRequestStatusCell value={getValue()} row={row} />
                ),
            }),
        ],
        [],
    );

    const table = useReactTable(
        withTableState(effectiveTableState, setTableState, {
            columns,
            data,
        }),
    );
    const tableId = useId();
    const handleQuickFilterChange = (filter: ChangeRequestQuickFilter) => {
        if (!user) {
            // todo (globalChangeRequestList): handle this somehow? Or just ignore.
            return;
        }
        const [targetProperty, otherProperty] =
            filter === 'Created'
                ? ['createdBy', 'requestedApproverId']
                : ['requestedApproverId', 'createdBy'];

        // todo (globalChangeRequestList): extract and test the logic for wiping out createdby/requestedapproverid
        setTableState((state) => ({
            [targetProperty]: {
                operator: 'IS',
                values: [user.id.toString()],
            },
            [otherProperty]:
                state[otherProperty]?.values.length === 1 &&
                state[otherProperty].values[0] === user.id.toString()
                    ? null
                    : state[otherProperty],
        }));
    };

    const bodyLoadingRef = useLoading(loading);

    return (
        <PageContent
            bodyClass='no-padding'
            header={<PageHeader title='Change requests' />}
        >
            <ChangeRequestFilters
                ariaControlTarget={tableId}
                initialSelection={initialFilter}
                onSelectionChange={handleQuickFilterChange}
            />

            <div
                id={tableId}
                className={themeStyles.fullwidth}
                ref={bodyLoadingRef}
            >
                <PaginatedTable tableInstance={table} totalItems={total} />
                {data.length === 0 && !loading ? (
                    <Box sx={(theme) => ({ padding: theme.spacing(1, 3, 3) })}>
                        <TablePlaceholder>
                            No change requests found.
                        </TablePlaceholder>
                    </Box>
                ) : null}
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
