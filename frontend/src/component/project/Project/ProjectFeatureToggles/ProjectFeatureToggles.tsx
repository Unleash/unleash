import { useCallback, useEffect, useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFilters, useSortBy, useTable } from 'react-table';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { PageContent } from 'component/common/PageContent/PageContent';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { getCreateTogglePath } from 'utils/routePathHelpers';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { sortTypes } from 'utils/sortTypes';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IProject } from 'interfaces/project';
import {
    Table,
    SortableTableHeader,
    TableBody,
    TableCell,
    TableRow,
    TablePlaceholder,
    TableSearch,
} from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import useProject from 'hooks/api/getters/useProject/useProject';
import { useLocalStorage } from 'hooks/useLocalStorage';
import useToast from 'hooks/useToast';
import { ENVIRONMENT_STRATEGY_ERROR } from 'constants/apiErrors';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import { useEnvironmentsRef } from './hooks/useEnvironmentsRef';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { FeatureToggleSwitch } from './FeatureToggleSwitch/FeatureToggleSwitch';
import { ActionsCell } from './ActionsCell/ActionsCell';
import { ColumnsMenu } from './ColumnsMenu/ColumnsMenu';
import { useStyles } from './ProjectFeatureToggles.styles';

interface IProjectFeatureTogglesProps {
    features: IProject['features'];
    environments: IProject['environments'];
    loading: boolean;
}

type ListItemType = Pick<
    IProject['features'][number],
    'name' | 'lastSeenAt' | 'createdAt' | 'type' | 'stale'
> & {
    environments: {
        [key in string]: {
            name: string;
            enabled: boolean;
        };
    };
};

const staticColumns = ['Actions', 'name'];
const limit = 300; // if above limit, render only `pageSize` of items
const pageSize = 100;

export const ProjectFeatureToggles = ({
    features,
    loading,
    environments: newEnvironments = [],
}: IProjectFeatureTogglesProps) => {
    const { classes: styles } = useStyles();
    const [strategiesDialogState, setStrategiesDialogState] = useState({
        open: false,
        featureId: '',
        environmentName: '',
    });
    const projectId = useRequiredPathParam('projectId');
    const navigate = useNavigate();
    const { uiConfig } = useUiConfig();
    const environments = useEnvironmentsRef(
        loading ? ['a', 'b', 'c'] : newEnvironments
    );
    const { refetch } = useProject(projectId);
    const { setToastData, setToastApiError } = useToast();

    const data = useMemo<ListItemType[]>(() => {
        if (loading) {
            return Array(6).fill({
                type: '-',
                name: 'Feature name',
                createdAt: new Date(),
                environments: {
                    production: { name: 'production', enabled: false },
                },
            }) as ListItemType[];
        }

        return features
            .slice(0, features.length > limit ? pageSize : limit)
            .map(
                ({
                    name,
                    lastSeenAt,
                    createdAt,
                    type,
                    stale,
                    environments: featureEnvironments,
                }) => ({
                    name,
                    lastSeenAt,
                    createdAt,
                    type,
                    stale,
                    environments: Object.fromEntries(
                        environments.map(env => [
                            env,
                            {
                                name: env,
                                enabled:
                                    featureEnvironments?.find(
                                        feature => feature?.name === env
                                    )?.enabled || false,
                            },
                        ])
                    ),
                })
            );
    }, [features, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    const { toggleFeatureEnvironmentOn, toggleFeatureEnvironmentOff } =
        useFeatureApi();
    const onToggle = useCallback(
        async (
            projectId: string,
            featureName: string,
            environment: string,
            enabled: boolean
        ) => {
            try {
                if (enabled) {
                    await toggleFeatureEnvironmentOn(
                        projectId,
                        featureName,
                        environment
                    );
                } else {
                    await toggleFeatureEnvironmentOff(
                        projectId,
                        featureName,
                        environment
                    );
                }
                refetch();
            } catch (error) {
                const message = formatUnknownError(error);
                if (message === ENVIRONMENT_STRATEGY_ERROR) {
                    setStrategiesDialogState({
                        open: true,
                        featureId: featureName,
                        environmentName: environment,
                    });
                } else {
                    setToastApiError(message);
                }
                throw error; // caught when reverting optimistic update
            }

            setToastData({
                type: 'success',
                title: 'Updated toggle status',
                text: 'Successfully updated toggle status.',
            });
            refetch();
        },
        [toggleFeatureEnvironmentOff, toggleFeatureEnvironmentOn] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: FeatureSeenCell,
                sortType: 'date',
                align: 'center',
                disableGlobalFilter: true,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: FeatureTypeCell,
                align: 'center',
                disableGlobalFilter: true,
            },
            {
                Header: 'Feature toggle name',
                accessor: 'name',
                Cell: ({ value }: { value: string }) => (
                    <LinkCell
                        title={value}
                        to={`/projects/${projectId}/features/${value}`}
                    />
                ),
                width: '99%',
                minWidth: 100,
                maxWidth: 200,
                sortType: 'alphanumeric',
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                sortType: 'date',
                align: 'center',
                disableGlobalFilter: true,
            },
            ...environments.map(name => ({
                Header: loading ? () => '' : name,
                maxWidth: 90,
                minWidth: 90,
                accessor: `environments.${name}`,
                align: 'center',
                disableGlobalFilter: true,
                Cell: ({
                    value,
                    row: { original: feature },
                }: {
                    value: { name: string; enabled: boolean };
                    row: { original: ListItemType };
                }) => (
                    <FeatureToggleSwitch
                        value={value?.enabled || false}
                        projectId={projectId}
                        featureName={feature?.name}
                        environmentName={value?.name}
                        onToggle={onToggle}
                    />
                ),
                sortType: (v1: any, v2: any, id: string) => {
                    const a = v1?.values?.[id]?.enabled;
                    const b = v2?.values?.[id]?.enabled;
                    return a === b ? 0 : a ? -1 : 1;
                },
            })),
            {
                id: 'Actions',
                maxWidth: 56,
                width: 56,
                Cell: (props: { row: { original: ListItemType } }) => (
                    <ActionsCell projectId={projectId} {...props} />
                ),
                disableSortBy: true,
                disableGlobalFilter: true,
            },
        ],
        [projectId, environments, onToggle, loading]
    );
    const [searchParams, setSearchParams] = useSearchParams();
    const [storedParams, setStoredParams] = useLocalStorage<{
        columns?: string[];
    }>(`${projectId}:ProjectFeatureToggles`, {});

    const initialState = useMemo(
        () => {
            const allColumnIds = columns.map(
                (column: any) => column?.accessor || column?.id
            );
            let hiddenColumns = environments
                .filter((_, index) => index >= 3)
                .map(environment => `environments.${environment}`);

            if (searchParams.has('columns')) {
                const columnsInParams =
                    searchParams.get('columns')?.split(',') || [];
                const visibleColumns = [...staticColumns, ...columnsInParams];
                hiddenColumns = allColumnIds.filter(
                    columnId => !visibleColumns.includes(columnId)
                );
            } else if (storedParams.columns) {
                const visibleColumns = [
                    ...staticColumns,
                    ...storedParams.columns,
                ];
                hiddenColumns = allColumnIds.filter(
                    columnId => !visibleColumns.includes(columnId)
                );
            }

            return {
                sortBy: [
                    {
                        id: searchParams.get('sort') || 'createdAt',
                        desc: searchParams.has('order')
                            ? searchParams.get('order') === 'desc'
                            : false,
                    },
                ],
                hiddenColumns,
                filters: [
                    { id: 'name', value: searchParams.get('search') || '' },
                ],
            };
        },
        [environments] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const {
        allColumns,
        headerGroups,
        rows,
        state: { filters, sortBy, hiddenColumns },
        getTableBodyProps,
        getTableProps,
        prepareRow,
        setFilter,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetGlobalFilter: false,
            disableSortRemove: true,
            autoResetSortBy: false,
        },
        useFilters,
        useSortBy
    );

    const filter = useMemo(
        () =>
            filters?.find(filterRow => filterRow?.id === 'name')?.value ||
            initialState.filters[0].value,
        [filters, initialState]
    );

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState: Record<string, string> = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (filter) {
            tableState.search = filter;
        }
        tableState.columns = allColumns
            .map(({ id }) => id)
            .filter(
                id =>
                    !staticColumns.includes(id) && !hiddenColumns?.includes(id)
            )
            .join(',');

        setSearchParams(tableState, {
            replace: true,
        });
    }, [loading, sortBy, hiddenColumns, filter, setSearchParams, allColumns]);

    const onCustomizeColumns = useCallback(
        visibleColumns => {
            setStoredParams({
                columns: visibleColumns,
            });
        },
        [setStoredParams]
    );

    return (
        <PageContent
            isLoading={loading}
            className={styles.container}
            bodyClass={styles.bodyClass}
            header={
                <PageHeader
                    className={styles.title}
                    title={`Project feature toggles (${
                        features?.length > limit
                            ? `first ${rows.length} of ${features.length}`
                            : data.length
                    })`}
                    actions={
                        <>
                            <TableSearch
                                initialValue={filter}
                                onChange={value => setFilter('name', value)}
                            />
                            <ColumnsMenu
                                allColumns={allColumns}
                                staticColumns={staticColumns}
                                dividerAfter={['createdAt']}
                                dividerBefore={['Actions']}
                                isCustomized={Boolean(storedParams.columns)}
                                onCustomize={onCustomizeColumns}
                                setHiddenColumns={setHiddenColumns}
                            />
                            <PageHeader.Divider />
                            <ResponsiveButton
                                onClick={() =>
                                    navigate(
                                        getCreateTogglePath(
                                            projectId,
                                            uiConfig.flags.E
                                        )
                                    )
                                }
                                maxWidth="700px"
                                Icon={Add}
                                projectId={projectId}
                                permission={CREATE_FEATURE}
                                className={styles.button}
                            >
                                New feature toggle
                            </ResponsiveButton>
                        </>
                    }
                />
            }
        >
            <SearchHighlightProvider value={filter}>
                <Table {...getTableProps()}>
                    <SortableTableHeader
                        // @ts-expect-error -- verify after `react-table` v8
                        headerGroups={headerGroups}
                        className={styles.headerClass}
                    />
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
                        condition={filter?.length > 0}
                        show={
                            <TablePlaceholder>
                                No features found matching &ldquo;
                                {filter}
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
            <EnvironmentStrategyDialog
                onClose={() =>
                    setStrategiesDialogState(prev => ({ ...prev, open: false }))
                }
                projectId={projectId}
                {...strategiesDialogState}
            />
        </PageContent>
    );
};
