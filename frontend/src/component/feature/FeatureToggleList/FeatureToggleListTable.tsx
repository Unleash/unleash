import { useEffect, useMemo, useState, VFC } from 'react';
import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
    SortingRule,
    useFlexLayout,
    useGlobalFilter,
    useSortBy,
    useTable,
} from 'react-table';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
    TableSearch,
} from 'component/common/Table';
import { useFeatures } from 'hooks/api/getters/useFeatures/useFeatures';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureNameCell } from 'component/common/Table/cells/FeatureNameCell/FeatureNameCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { sortTypes } from 'utils/sortTypes';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { useVirtualizedRange } from 'hooks/useVirtualizedRange';
import { FeatureSchema } from 'openapi';
import { CreateFeatureButton } from '../CreateFeatureButton/CreateFeatureButton';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { useStyles } from './styles';

const featuresPlaceholder: FeatureSchema[] = Array(15).fill({
    name: 'Name of the feature',
    description: 'Short description of the feature',
    type: '-',
    createdAt: new Date(2022, 1, 1),
    project: 'projectID',
});

type PageQueryType = Partial<Record<'sort' | 'order' | 'search', string>>;

const columns = [
    {
        Header: 'Seen',
        accessor: 'lastSeenAt',
        Cell: FeatureSeenCell,
        sortType: 'date',
        align: 'center',
        maxWidth: 85,
        disableGlobalFilter: true,
    },
    {
        Header: 'Type',
        accessor: 'type',
        Cell: FeatureTypeCell,
        align: 'center',
        maxWidth: 85,
        disableGlobalFilter: true,
    },
    {
        Header: 'Name',
        accessor: 'name',
        minWidth: 150,
        Cell: FeatureNameCell,
        sortType: 'alphanumeric',
    },
    {
        Header: 'Created',
        accessor: 'createdAt',
        Cell: DateCell,
        sortType: 'date',
        maxWidth: 150,
        disableGlobalFilter: true,
    },
    {
        Header: 'Project ID',
        accessor: 'project',
        Cell: ({ value }: { value: string }) => (
            <LinkCell title={value} to={`/projects/${value}`} />
        ),
        sortType: 'alphanumeric',
        maxWidth: 150,
    },
    {
        Header: 'State',
        accessor: 'stale',
        Cell: FeatureStaleCell,
        sortType: 'boolean',
        maxWidth: 120,
        disableGlobalFilter: true,
    },
    // Always hidden -- for search
    {
        accessor: 'description',
    },
];

const defaultSort: SortingRule<string> = { id: 'createdAt', desc: true };

export const FeatureToggleListTable: VFC = () => {
    const theme = useTheme();
    const rowHeight = theme.shape.tableRowHeight;
    const { classes } = useStyles();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [storedParams, setStoredParams] = useLocalStorage(
        'FeatureToggleListTable:v1',
        defaultSort
    );
    const { features = [], loading } = useFeatures();
    const data = useMemo(
        () =>
            features?.length === 0 && loading ? featuresPlaceholder : features,
        [features, loading]
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
            // @ts-expect-error -- fix in react-table v8
            columns,
            // @ts-expect-error -- fix in react-table v8
            data,
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
            hiddenColumns.push('lastSeenAt', 'stale');
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
                    title={`Feature toggles (${
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
                            <PageHeader.Divider />
                            <Link
                                component={RouterLink}
                                to="/archive"
                                underline="always"
                                sx={{ marginRight: 3 }}
                            >
                                View archive
                            </Link>
                            <CreateFeatureButton
                                loading={false}
                                filter={{ query: '', project: 'default' }}
                            />
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()} rowHeight={rowHeight}>
                    {/* @ts-expect-error -- fix in react-table v8 */}
                    <SortableTableHeader headerGroups={headerGroups} flex />
                    <TableBody
                        {...getTableBodyProps()}
                        style={{
                            height: `${rowHeight * rows.length}px`,
                            position: 'relative',
                        }}
                    >
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
                                    key={row.id}
                                    className={classes.row}
                                    style={{
                                        top: `${index * rowHeight}px`,
                                        display: 'flex',
                                    }}
                                >
                                    {row.cells.map(cell => (
                                        <TableCell
                                            {...cell.getCellProps({
                                                style: {
                                                    flex: cell.column.minWidth
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
