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

// Mock data based on the image
const mockChangeRequests = [
    {
        id: 24,
        title: 'change request #024',
        project: 'auth-application',
        projectName: 'Auth application',
        features: [{ name: 'hubspotDebugLogging' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Review required',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'auth-application',
        projectName: 'Auth application',
        features: [{ name: 'strictSchemaValidation' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Approved',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'developer-experience',
        projectName: 'Developer experience',
        features: [{ name: 'debugFlag' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Review required',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'auth-application',
        projectName: 'Auth application',
        features: [{ name: 'consumptionSync' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Sandbox',
        state: 'Review required',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'platform',
        projectName: 'Platform',
        features: [{ name: 'etagByEnv' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Sandbox',
        state: 'Scheduled',
        schedule: {
            scheduledAt: '2024-01-12T09:46:51+05:30',
            status: 'pending',
        },
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'unleash-cloud',
        projectName: 'Unleash Cloud',
        features: [{ name: 'fetchMode' }],
        segments: [],
        createdBy: { username: 'jane', name: 'Jane Smith', imageUrl: null },
        createdAt: '2024-01-09T14:30:00Z',
        environment: 'Testing',
        state: 'Approved',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'unleash-cloud',
        projectName: 'Unleash Cloud',
        features: [{ name: 'consumptionModelUI' }],
        segments: [],
        createdBy: { username: 'jane', name: 'Jane Smith', imageUrl: null },
        createdAt: '2024-01-09T14:30:00Z',
        environment: 'Testing',
        state: 'Approved',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'enterprise-frontend',
        projectName: 'Enterprise Front End',
        features: [{ name: 'sso-provider-error-details' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Approved',
    },
    {
        id: 24,
        title: 'change request #024',
        project: 'auth-application',
        projectName: 'Auth application',
        features: [{ name: 'filterFlagsToArchive' }],
        segments: [],
        createdBy: { username: 'bruce', name: 'Bruce Wayne', imageUrl: null },
        createdAt: '2024-01-10T10:22:00Z',
        environment: 'Production',
        state: 'Approved',
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
