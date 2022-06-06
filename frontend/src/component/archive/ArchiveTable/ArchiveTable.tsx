import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    SortableTableHeader,
    Table,
    TableBody,
    TableCell,
    TablePlaceholder,
    TableRow,
    TableSearch,
} from 'component/common/Table';
import {
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useEffect, useMemo, useState } from 'react';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureTypeCell } from '../../common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureSeenCell } from '../../common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { LinkCell } from '../../common/Table/cells/LinkCell/LinkCell';
import { FeatureStaleCell } from '../../feature/FeatureToggleList/FeatureStaleCell/FeatureStaleCell';
import { TimeAgoCell } from '../../common/Table/cells/TimeAgoCell/TimeAgoCell';
import { ReviveArchivedFeatureCell } from 'component/common/Table/cells/ReviveArchivedFeatureCell/ReviveArchivedFeatureCell';
import { useStyles } from '../../feature/FeatureToggleList/styles';
import { useVirtualizedRange } from '../../../hooks/useVirtualizedRange';
import {
    featuresPlaceholder,
    PageQueryType,
} from '../../feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import { FeatureSchema } from '../../../openapi';
import { useFeatureArchiveApi } from '../../../hooks/api/actions/useFeatureArchiveApi/useReviveFeatureApi';
import useToast from '../../../hooks/useToast';

export interface IFeaturesArchiveTableProps {
    archivedFeatures: FeatureSchema[];
    refetch: any;
    loading: boolean;
    inProject: boolean;
    storedParams: any;
    setStoredParams: any;
    searchParams: any;
    setSearchParams: any;
}

export const ArchiveTable = ({
    archivedFeatures = [],
    loading,
    inProject,
    refetch,
    storedParams,
    setStoredParams,
    searchParams,
    setSearchParams,
}: IFeaturesArchiveTableProps) => {
    const rowHeight = theme.shape.tableRowHeight;
    const { classes } = useStyles();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const { setToastData, setToastApiError } = useToast();

    const { reviveFeature } = useFeatureArchiveApi();

    const onRevive = (feature: string) => {
        reviveFeature(feature)
            .then(refetch)
            .then(() =>
                setToastData({
                    type: 'success',
                    title: "And we're back!",
                    text: 'The feature toggle has been revived.',
                    confetti: true,
                })
            )
            .catch(e => setToastApiError(e.toString()));
    };

    const columns = useColumns(onRevive);

    const data = useMemo(
        () =>
            archivedFeatures?.length === 0 && loading
                ? featuresPlaceholder
                : archivedFeatures,
        [archivedFeatures, loading]
    );

    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['description'],
        globalFilter: searchParams.get('search') || '',
    }));

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter, sortBy },
        setGlobalFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any,
            data: data as any,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            autoResetSortBy: false,
            disableSortRemove: true,
            disableMultiSort: true,
        },
        useGlobalFilter,
        useSortBy,
        useFlexLayout
    );

    useEffect(() => {
        const hiddenColumns = ['description'];
        if (isMediumScreen) {
            hiddenColumns.push('lastSeenAt', 'status');
        }
        if (isSmallScreen) {
            hiddenColumns.push('type', 'createdAt');
        }
        setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, isSmallScreen, isMediumScreen]);

    useEffect(() => {
        const tableState: PageQueryType = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (globalFilter) {
            tableState.search = globalFilter;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [sortBy, globalFilter, setSearchParams, setStoredParams]);

    const [firstRenderedIndex, lastRenderedIndex] =
        useVirtualizedRange(rowHeight);

    return (
        <PageContent
            isLoading={loading}
            header={
                <PageHeader
                    title={`${
                        inProject ? 'Project Features Archive' : 'Archived'
                    } (${
                        rows.length < data.length
                            ? `${rows.length} of ${data.length}`
                            : data.length
                    })`}
                    actions={
                        <>
                            <TableSearch
                                initialValue={globalFilter}
                                onChange={setGlobalFilter}
                            />
                        </>
                    }
                />
            }
        >
            <ConditionallyRender
                condition={!loading && data.length === 0}
                show={<TablePlaceholder />}
                elseShow={() => (
                    <>
                        <SearchHighlightProvider value={globalFilter}>
                            <Table {...getTableProps()} rowHeight="standard">
                                <SortableTableHeader
                                    headerGroups={headerGroups as any}
                                />
                                <TableBody {...getTableBodyProps()}>
                                    {rows.map((row, index) => {
                                        const isVirtual =
                                            index < firstRenderedIndex ||
                                            index > lastRenderedIndex;

                                        if (isVirtual) {
                                            return null;
                                        }

                                        prepareRow(row);
                                        return (
                                            <TableRow
                                                hover
                                                {...row.getRowProps()}
                                            >
                                                {row.cells.map(cell => (
                                                    <TableCell
                                                        {...cell.getCellProps({
                                                            style: {
                                                                flex: cell
                                                                    .column
                                                                    .minWidth
                                                                    ? '1 0 auto'
                                                                    : undefined,
                                                            },
                                                        })}
                                                        className={classes.cell}
                                                    >
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
                            condition={
                                rows.length === 0 && globalFilter?.length > 0
                            }
                            show={
                                <TablePlaceholder>
                                    No features found matching &ldquo;
                                    {globalFilter}&rdquo;
                                </TablePlaceholder>
                            }
                        />
                    </>
                )}
            />
        </PageContent>
    );
};

const useColumns = (onRevive: any) => {
    return [
        {
            id: 'Seen',
            Header: 'Seen',
            maxWidth: 85,
            canSort: true,
            Cell: FeatureSeenCell,
            disableGlobalFilter: true,
        },
        {
            id: 'Type',
            Header: 'Type',
            maxWidth: 85,
            canSort: true,
            Cell: FeatureTypeCell,
            disableGlobalFilter: true,
        },
        {
            Header: 'Feature toggle Name',
            accessor: 'name',
            maxWidth: 150,
            Cell: ({ value, row: { original } }: any) => (
                <HighlightCell value={value} subtitle={original.description} />
            ),
            sortType: 'alphanumeric',
        },
        {
            Header: 'Created',
            accessor: 'createdAt',
            maxWidth: 150,
            Cell: DateCell,
            sortType: 'date',
            disableGlobalFilter: true,
        },
        {
            Header: 'Archived',
            accessor: 'archivedAt',
            maxWidth: 150,
            Cell: TimeAgoCell,
            sortType: 'date',
            disableGlobalFilter: true,
        },
        {
            Header: 'Project ID',
            accessor: 'project',
            sortType: 'alphanumeric',
            maxWidth: 150,
            Cell: ({ value }: any) => (
                <LinkCell title={value} to={`/projects/${value}}`} />
            ),
        },
        {
            Header: 'Status',
            accessor: 'stale',
            Cell: FeatureStaleCell,
            sortType: 'boolean',
            maxWidth: 120,
            disableGlobalFilter: true,
        },
        {
            Header: 'Actions',
            id: 'Actions',
            align: 'center',
            maxWidth: 85,
            canSort: false,
            disableGlobalFilter: true,
            Cell: ({ row: { original } }: any) => (
                <ReviveArchivedFeatureCell
                    onRevive={() => onRevive(original.name)}
                />
            ),
        },
    ];
};
