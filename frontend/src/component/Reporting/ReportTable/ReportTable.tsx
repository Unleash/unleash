import { IFeatureToggleListItem } from 'interfaces/featureToggle';
import {
    SortableTableHeader,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { sortTypes } from 'utils/sortTypes';
import { useSortBy, useGlobalFilter, useTable } from 'react-table';
import { Table, TableBody, TableRow, useMediaQuery } from '@mui/material';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ReportExpiredCell } from 'component/Reporting/ReportExpiredCell/ReportExpiredCell';
import { ReportStatusCell } from 'component/Reporting/ReportStatusCell/ReportStatusCell';
import { useMemo, useEffect } from 'react';
import {
    formatStatus,
    ReportingStatus,
} from 'component/Reporting/ReportStatusCell/formatStatus';
import { formatExpiredAt } from 'component/Reporting/ReportExpiredCell/formatExpiredAt';
import { FeatureStaleCell } from 'component/feature/FeatureToggleList/FeatureStaleCell/FeatureStaleCell';
import theme from 'themes/theme';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';

interface IReportTableProps {
    projectId: string;
    features: IFeatureToggleListItem[];
}

export interface IReportTableRow {
    project: string;
    name: string;
    type: string;
    stale?: boolean;
    status: ReportingStatus;
    lastSeenAt?: string;
    createdAt: string;
    expiredAt?: string;
}

export const ReportTable = ({ projectId, features }: IReportTableProps) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const data: IReportTableRow[] = useMemo(() => {
        return features.map(feature => {
            return createReportTableRow(projectId, feature);
        });
    }, [projectId, features]);

    const initialState = useMemo(
        () => ({
            hiddenColumns: [],
            sortBy: [{ id: 'createdAt', desc: true }],
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: data as any,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        const hiddenColumns = [];
        if (isSmallScreen) {
            hiddenColumns.push('createdAt', 'expiredAt');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen]);

    const header = (
        <PageHeader
            title="Overview"
            actions={
                <Search
                    initialValue={globalFilter}
                    onChange={setGlobalFilter}
                />
            }
        />
    );

    return (
        <PageContent header={header}>
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <TableRow hover {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <TableCell {...cell.getCellProps()}>
                                            {cell.render('Cell')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature toggles found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No feature toggles available. Get started by
                                adding a new feature toggle.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};

const createReportTableRow = (
    projectId: string,
    report: IFeatureToggleListItem
): IReportTableRow => {
    return {
        project: projectId,
        name: report.name,
        type: report.type,
        stale: report.stale,
        status: formatStatus(report),
        lastSeenAt: report.lastSeenAt,
        createdAt: report.createdAt,
        expiredAt: formatExpiredAt(report),
    };
};

const COLUMNS = [
    {
        Header: 'Seen',
        accessor: 'lastSeenAt',
        sortType: 'date',
        align: 'center',
        Cell: FeatureSeenCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'Type',
        accessor: 'type',
        align: 'center',
        Cell: FeatureTypeCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'Name',
        accessor: 'name',
        width: '60%',
        sortType: 'alphanumeric',
        Cell: FeatureNameCell,
    },
    {
        Header: 'Created on',
        accessor: 'createdAt',
        sortType: 'date',
        Cell: DateCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'Expired',
        accessor: 'expiredAt',
        Cell: ReportExpiredCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'Status',
        accessor: 'status',
        Cell: ReportStatusCell,
        disableGlobalFilter: true,
    },
    {
        Header: 'State',
        accessor: 'stale',
        sortType: 'boolean',
        Cell: FeatureStaleCell,
        disableGlobalFilter: true,
    },
];
