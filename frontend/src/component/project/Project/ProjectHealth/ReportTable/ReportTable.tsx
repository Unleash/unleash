import { useMemo } from 'react';
import type {
    IEnvironments,
    IFeatureFlagListItem,
} from 'interfaces/featureToggle';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { PageContent } from 'component/common/PageContent/PageContent';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { sortTypes } from 'utils/sortTypes';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';
import { useMediaQuery, useTheme } from '@mui/material';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { FeatureStaleCell } from 'component/feature/FeatureToggleList/FeatureStaleCell/FeatureStaleCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { ReportExpiredCell } from './ReportExpiredCell/ReportExpiredCell';
import { ReportStatusCell } from './ReportStatusCell/ReportStatusCell';
import {
    formatStatus,
    type ReportingStatus,
} from './ReportStatusCell/formatStatus';
import { formatExpiredAt } from './ReportExpiredCell/formatExpiredAt';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useFeatureTypes from 'hooks/api/getters/useFeatureTypes/useFeatureTypes';

interface IReportTableProps {
    projectId: string;
    features: IFeatureFlagListItem[];
}

export interface IReportTableRow {
    project: string;
    name: string;
    type: string;
    stale?: boolean;
    status: ReportingStatus;
    lastSeenAt?: string;
    environments?: IEnvironments[];
    createdAt: string;
    expiredAt?: string;
}

export const ReportTable = ({ projectId, features }: IReportTableProps) => {
    const theme = useTheme();
    const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const { uiConfig } = useUiConfig();

    const { featureTypes } = useFeatureTypes();

    const data: IReportTableRow[] = useMemo<IReportTableRow[]>(
        () =>
            features.map((report) => ({
                project: projectId,
                name: report.name,
                type: report.type,
                stale: report.stale,
                environments: report.environments,
                status: formatStatus(report, featureTypes),
                lastSeenAt: report.lastSeenAt,
                createdAt: report.createdAt,
                expiredAt: formatExpiredAt(report, featureTypes),
            })),
        [projectId, features, featureTypes],
    );

    const initialState = useMemo(
        () => ({
            hiddenColumns: [],
            sortBy: [{ id: 'createdAt', desc: true }],
        }),
        [],
    );

    const COLUMNS = useMemo(
        () => [
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: ({ value, row: { original: feature } }: any) => {
                    return <FeatureEnvironmentSeenCell feature={feature} />;
                },
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                align: 'center',
                Cell: FeatureTypeCell,
                disableGlobalFilter: true,
                maxWidth: 85,
            },
            {
                Header: 'Name',
                accessor: 'name',
                sortType: 'alphanumeric',
                Cell: FeatureNameCell,
                minWidth: 120,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                disableGlobalFilter: true,
                maxWidth: 150,
            },
            {
                Header: 'Expired',
                accessor: 'expiredAt',
                Cell: ReportExpiredCell,
                disableGlobalFilter: true,
                maxWidth: 150,
            },
            {
                Header: 'Status',
                id: 'status',
                accessor: 'status',
                Cell: ReportStatusCell,
                disableGlobalFilter: true,
                width: 180,
            },
            {
                Header: 'State',
                accessor: 'stale',
                sortType: 'boolean',
                Cell: FeatureStaleCell,
                disableGlobalFilter: true,
                maxWidth: 120,
            },
        ],
        [],
    );

    const {
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
            autoResetHiddenColumns: false,
            autoResetSortBy: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useFlexLayout,
        useSortBy,
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isExtraSmallScreen,
                columns: ['stale'],
            },
            {
                condition: isSmallScreen,
                columns: ['expiredAt', 'lastSeenAt'],
            },
            {
                condition: isMediumScreen,
                columns: ['createdAt'],
            },
        ],
        setHiddenColumns,
        COLUMNS,
    );

    const title =
        rows.length < data.length
            ? `Feature flags (${rows.length} of ${data.length})`
            : `Feature flags (${data.length})`;

    return (
        <PageContent
            header={
                <PageHeader
                    title={title}
                    actions={
                        <Search
                            initialValue={globalFilter}
                            onChange={setGlobalFilter}
                        />
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <VirtualizedTable
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                    rows={rows}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={globalFilter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature flags found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No feature flags available. Get started by
                                adding a new feature flag.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </PageContent>
    );
};
