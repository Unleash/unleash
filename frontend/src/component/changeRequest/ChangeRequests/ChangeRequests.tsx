import { useMemo } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from 'component/common/Table';
import { useSortBy, useTable } from 'react-table';
import { sortTypes } from 'utils/sortTypes';
import { TimeAgoCell } from 'component/common/Table/cells/TimeAgoCell/TimeAgoCell';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { ChangeRequestStatusCell } from 'component/changeRequest/ProjectChangeRequests/ChangeRequestsTabs/ChangeRequestStatusCell';
import { AvatarCell } from 'component/changeRequest/ProjectChangeRequests/ChangeRequestsTabs/AvatarCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { GlobalChangeRequestTitleCell } from './GlobalChangeRequestTitleCell.js';
import { FeaturesCell } from '../ProjectChangeRequests/ChangeRequestsTabs/FeaturesCell.js';

// Mock data with varied projects and change requests
const mockChangeRequests = [
    {
        id: 101,
        title: 'Activate harpoons',
        project: 'payment-service',
        projectName: 'Payment Service',
        features: [{ name: 'securePaymentFlow' }],
        segments: [],
        createdBy: { username: 'alice', name: 'Alice Johnson', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Review required',
    },
    {
        id: 102,
        title: 'change request #102',
        project: 'user-management',
        projectName: 'User Management',
        features: [{ name: 'enhancedValidation' }],
        segments: [],
        createdBy: { username: 'bob', name: 'Bob Smith', imageUrl: null },
        createdAt: '2024-01-10T08:15:00Z',
        environment: 'Production',
        state: 'Approved',
    },
    {
        id: 103,
        title: 'Enable new checkout flow',
        project: 'e-commerce-platform',
        projectName: 'E-commerce Platform',
        features: [{ name: 'newCheckoutUX' }, { name: 'paymentOptionsV2' }],
        segments: [],
        createdBy: { username: 'carol', name: 'Carol Davis', imageUrl: null },
        createdAt: '2024-01-10T12:30:00Z',
        environment: 'Testing',
        state: 'Review required',
    },
    {
        id: 104,
        title: 'Update user permissions',
        project: 'user-management',
        projectName: 'User Management',
        features: [
            { name: 'roleBasedAccess' },
            { name: 'permissionMatrix' },
            { name: 'adminDashboard' },
        ],
        segments: [],
        createdBy: { username: 'david', name: 'David Wilson', imageUrl: null },
        createdAt: '2024-01-09T16:45:00Z',
        environment: 'Sandbox',
        state: 'Review required',
    },
    {
        id: 105,
        title: 'Deploy feature rollback',
        project: 'analytics-platform',
        projectName: 'Analytics Platform',
        features: [
            { name: 'performanceTracking' },
            { name: 'realTimeAnalytics' },
            { name: 'customDashboards' },
            { name: 'dataExport' },
        ],
        segments: [],
        createdBy: { username: 'eve', name: 'Eve Brown', imageUrl: null },
        createdAt: '2024-01-09T14:20:00Z',
        environment: 'Sandbox',
        state: 'Scheduled',
        schedule: {
            scheduledAt: '2024-01-12T09:46:51+05:30',
            status: 'pending',
        },
    },
    {
        id: 106,
        title: 'change request #106',
        project: 'notification-service',
        projectName: 'Notification Service',
        features: [{ name: 'emailTemplates' }],
        segments: [],
        createdBy: { username: 'frank', name: 'Frank Miller', imageUrl: null },
        createdAt: '2024-01-08T11:00:00Z',
        environment: 'Testing',
        state: 'Approved',
    },
    {
        id: 107,
        title: 'Optimize database queries',
        project: 'data-warehouse',
        projectName: 'Data Warehouse',
        features: [{ name: 'queryOptimization' }],
        segments: [],
        createdBy: { username: 'grace', name: 'Grace Lee', imageUrl: null },
        createdAt: '2024-01-08T09:30:00Z',
        environment: 'Testing',
        state: 'Approved',
    },
    {
        id: 108,
        title: 'change request #108',
        project: 'mobile-app',
        projectName: 'Mobile App',
        features: [{ name: 'pushNotifications' }],
        segments: [],
        createdBy: { username: 'henry', name: 'Henry Chen', imageUrl: null },
        createdAt: '2024-01-07T15:20:00Z',
        environment: 'Production',
        state: 'Approved',
    },
    {
        id: 109,
        title: 'Archive legacy features',
        project: 'payment-service',
        projectName: 'Payment Service',
        features: [{ name: 'legacyPaymentGateway' }],
        segments: [],
        createdBy: { username: 'alice', name: 'Alice Johnson', imageUrl: null },
        createdAt: '2024-01-07T13:10:00Z',
        environment: 'Production',
        state: 'Rejected',
    },
];

export const ChangeRequests = () => {
    const loading = false;
    const columns = useMemo(
        () => [
            {
                id: 'Title',
                Header: 'Title',
                // todo (globalChangeRequestList): sort out width calculation. It's configured both here with a min width down in the inner cell?
                width: 300,
                canSort: true,
                accessor: 'title',
                Cell: GlobalChangeRequestTitleCell,
            },
            {
                id: 'Updated feature flags',
                Header: 'Updated feature flags',
                canSort: false,
                accessor: 'features',
                searchable: true,
                filterName: 'feature',
                filterParsing: (values: Array<{ name: string }>) => {
                    return values?.map(({ name }) => name).join('\n') || '';
                },
                filterBy: (
                    row: { features: Array<{ name: string }> },
                    values: Array<string>,
                ) => {
                    return row.features.find((feature) =>
                        values
                            .map((value) => value.toLowerCase())
                            .includes(feature.name.toLowerCase()),
                    );
                },
                Cell: ({
                    value,
                    row: {
                        original: { title, project },
                    },
                }: any) => (
                    <FeaturesCell project={project} value={value} key={title} />
                ),
            },
            {
                Header: 'By',
                accessor: 'createdBy',
                maxWidth: 180,
                canSort: false,
                Cell: AvatarCell,
                align: 'left',
                searchable: true,
                filterName: 'by',
                filterParsing: (value: { username?: string }) =>
                    value?.username || '',
            },
            {
                Header: 'Submitted',
                accessor: 'createdAt',
                maxWidth: 100,
                Cell: TimeAgoCell,
            },
            {
                Header: 'Environment',
                accessor: 'environment',
                searchable: true,
                maxWidth: 100,
                Cell: HighlightCell,
                filterName: 'environment',
            },
            {
                Header: 'Status',
                accessor: 'state',
                searchable: true,
                maxWidth: '170px',
                Cell: ChangeRequestStatusCell,
                filterName: 'status',
            },
        ],
        [],
    );

    const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
        useTable(
            {
                columns: columns as any[],
                data: mockChangeRequests,
                initialState: {
                    sortBy: [
                        {
                            id: 'createdAt',
                            desc: true,
                        },
                    ],
                },
                sortTypes,
                autoResetHiddenColumns: false,
                disableSortRemove: true,
                autoResetSortBy: false,
                defaultColumn: {
                    Cell: TextCell,
                },
            },
            useSortBy,
        );

    return (
        <PageContent
            isLoading={loading}
            header={<PageHeader title='Change requests' />}
        >
            <Table {...getTableProps()}>
                <SortableTableHeader headerGroups={headerGroups} />
                <TableBody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        const { key, ...rowProps } = row.getRowProps();
                        return (
                            <TableRow hover key={key} {...rowProps}>
                                {row.cells.map((cell) => {
                                    const { key, ...cellProps } =
                                        cell.getCellProps();
                                    return (
                                        <TableCell key={key} {...cellProps}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </PageContent>
    );
};
