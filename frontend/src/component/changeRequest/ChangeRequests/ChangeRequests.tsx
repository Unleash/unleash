import { useId, useMemo } from 'react';
import { Box, styled } from '@mui/material';
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
    type SearchChangeRequestsInput,
} from 'hooks/api/getters/useChangeRequestSearch/useChangeRequestSearch';
import type { ChangeRequestSearchItemSchema } from 'openapi';
import { useQueryParams, encodeQueryParams } from 'use-query-params';
import useLoading from 'hooks/useLoading';
import { styles as themeStyles } from 'component/common';
import { ChangeRequestFilters } from './ChangeRequestFilters/ChangeRequestFilters.js';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser.js';
import type { IUser } from 'interfaces/user.js';
import { stateConfig } from './ChangeRequests.types.js';

const columnHelper = createColumnHelper<ChangeRequestSearchItemSchema>();

const StyledPaginatedTable = styled(
    PaginatedTable<ChangeRequestSearchItemSchema>,
)(() => ({
    th: {
        whiteSpace: 'nowrap',
    },

    td: {
        verticalAlign: 'top',
        maxWidth: '250px',
    },
}));

const defaultTableState = (user: IUser) => ({
    createdBy: {
        operator: 'IS' as const,
        values: [user.id.toString()],
    },
    state: {
        operator: 'IS' as const,
        values: ['open'],
    },
});

const ChangeRequestsInner = ({ user }: { user: IUser }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldApplyDefaults = !urlParams.toString();

    const initialState = shouldApplyDefaults ? defaultTableState(user) : {};

    const [tableState, setTableState] = useQueryParams(stateConfig, {
        updateType: 'replaceIn',
    });

    const effectiveTableState = shouldApplyDefaults
        ? {
              ...tableState,
              ...initialState,
          }
        : tableState;

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
            columnHelper.accessor('id', {
                header: 'Title',
                meta: { width: '35%' },
                cell: GlobalChangeRequestTitleCell,
            }),
            columnHelper.accessor('features', {
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
                header: 'Created by',
                meta: { width: '10%' },
                enableSorting: false,
                cell: ({ getValue }) => <AvatarCell value={getValue()} />,
            }),
            columnHelper.accessor('createdAt', {
                header: 'Submitted',
                meta: { width: '5%' },
                cell: ({ getValue }) => <TimeAgoCell value={getValue()} />,
            }),
            columnHelper.accessor('environment', {
                header: 'Environment',
                meta: { width: '10%' },
                cell: ({ getValue }) => (
                    <HighlightCell maxTitleLines={1} value={getValue()} />
                ),
            }),
            columnHelper.accessor('state', {
                header: 'Status',
                meta: { width: '10%' },
                cell: ({ getValue, row }) => (
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
    const bodyLoadingRef = useLoading(loading);

    return (
        <PageContent
            bodyClass='no-padding'
            header={<PageHeader title='Change requests' />}
        >
            <ChangeRequestFilters
                ariaControlTarget={tableId}
                tableState={effectiveTableState}
                setTableState={setTableState}
                userId={user.id}
            />

            <div
                id={tableId}
                className={themeStyles.fullwidth}
                ref={bodyLoadingRef}
            >
                <StyledPaginatedTable
                    tableInstance={table}
                    totalItems={total}
                />
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
    const { user } = useAuthUser();
    if (!useUiFlag('globalChangeRequestList')) {
        return (
            <PageContent header={<PageHeader title='Change requests' />}>
                <p>Nothing to see here. Move along.</p>
            </PageContent>
        );
    }

    if (!user) {
        return (
            <PageContent header={<PageHeader title='Change requests' />}>
                <p>
                    Failed to get your user information. Please refresh. If the
                    problem persists, get in touch.
                </p>
            </PageContent>
        );
    }

    return <ChangeRequestsInner user={user} />;
};
