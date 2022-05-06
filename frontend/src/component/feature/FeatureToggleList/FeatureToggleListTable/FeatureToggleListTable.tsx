import { useEffect, useMemo, VFC } from 'react';
import { Link, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import useLoading from 'hooks/useLoading';
import {
    TableContainer,
    TableToolbar,
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
    TableSearch,
} from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { DateCell } from './DateCell/DateCell';
import { FeatureLinkCell } from './FeatureLinkCell/FeatureLinkCell';
import { FeatureSeenCell } from './FeatureSeenCell/FeatureSeenCell';
import { FeatureStaleCell } from './FeatureStaleCell/FeatureStaleCell';
import { FeatureTypeCell } from './FeatureTypeCell/FeatureTypeCell';
import { CreateFeatureButton } from '../../CreateFeatureButton/CreateFeatureButton';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IExperimentProps {
    data: Record<string, any>[];
    isLoading?: boolean;
}

const sortTypes = {
    date: (a: any, b: any, id: string) =>
        b?.values?.[id]?.getTime() - a?.values?.[id]?.getTime(),
    boolean: (v1: any, v2: any, id: string) => {
        const a = v1?.values?.[id];
        const b = v2?.values?.[id];
        return a === b ? 0 : a ? 1 : -1;
    },
    alphanumeric: (a: any, b: any, id: string) =>
        a?.values?.[id]
            ?.toLowerCase()
            .localeCompare(b?.values?.[id]?.toLowerCase()),
};

const columns = [
    {
        Header: 'Seen',
        accessor: 'lastSeenAt',
        Cell: FeatureSeenCell,
        sortType: 'date',
        totalWidth: 120,
    },
    {
        Header: 'Type',
        accessor: 'type',
        Cell: FeatureTypeCell,
        totalWidth: 120,
    },
    {
        Header: 'Feature toggle name',
        accessor: 'name',
        Cell: ({
            row: {
                // @ts-expect-error -- props type
                original: { name, description, project },
            },
        }) => (
            <FeatureLinkCell
                title={name}
                subtitle={description}
                to={`/projects/${project}/features/${name}`}
            />
        ),
        sortType: 'alphanumeric',
    },
    {
        Header: 'Created on',
        accessor: 'createdAt',
        Cell: DateCell,
        sortType: 'date',
    },
    {
        Header: 'Project ID',
        accessor: 'project',
        Cell: ({ value }: { value: string }) => (
            <FeatureLinkCell title={value} to={`/projects/${value}`} />
        ),
        sortType: 'alphanumeric',
    },
    {
        Header: 'State',
        accessor: 'stale',
        Cell: FeatureStaleCell,
        sortType: 'boolean',
    },
    // Always hidden -- for search
    {
        accessor: 'description',
    },
];

export const FeatureToggleListTable: VFC<IExperimentProps> = ({
    data,
    isLoading = false,
}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const ref = useLoading(isLoading);

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'createdAt', desc: false }],
            hiddenColumns: ['description'],
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
            columns,
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            disableSortRemove: true,
        },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        if (isSmallScreen) {
            setHiddenColumns([
                'lastSeenAt',
                'type',
                'stale',
                'description',
                'createdAt',
            ]);
        } else if (isMediumScreen) {
            setHiddenColumns(['lastSeenAt', 'stale', 'description']);
        } else {
            setHiddenColumns(['description']);
        }
    }, [setHiddenColumns, isSmallScreen, isMediumScreen]);

    return (
        <TableContainer ref={ref}>
            <TableToolbar title={`Feature toggles (${data.length})`}>
                <TableSearch
                    initialValue={globalFilter}
                    onChange={setGlobalFilter}
                />
                <TableToolbar.Divider />
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
            </TableToolbar>
            <SearchHighlightProvider value={globalFilter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader headerGroups={headerGroups} />
                    <TableBody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <TableRow {...row.getRowProps()}>
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
                                No features or projects found matching &ldquo;
                                {globalFilter}
                                &rdquo;
                            </TablePlaceholder>
                        }
                        elseShow={
                            <TablePlaceholder>
                                No features available. Get started by adding a
                                new feature toggle.
                            </TablePlaceholder>
                        }
                    />
                }
            />
        </TableContainer>
    );
};
