import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/system';
import { Add } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFlexLayout, useSortBy, useTable, SortingRule } from 'react-table';
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
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import useProject from 'hooks/api/getters/useProject/useProject';
import { createLocalStorage } from 'utils/createLocalStorage';
import useToast from 'hooks/useToast';
import { ENVIRONMENT_STRATEGY_ERROR } from 'constants/apiErrors';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import { useEnvironmentsRef } from './hooks/useEnvironmentsRef';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { FeatureToggleSwitch } from './FeatureToggleSwitch/FeatureToggleSwitch';
import { ActionsCell } from './ActionsCell/ActionsCell';
import { ColumnsMenu } from './ColumnsMenu/ColumnsMenu';
import { useStyles } from './ProjectFeatureToggles.styles';
import { FeatureStaleDialog } from 'component/common/FeatureStaleDialog/FeatureStaleDialog';
import { FeatureArchiveDialog } from 'component/common/FeatureArchiveDialog/FeatureArchiveDialog';
import { useSearch } from 'hooks/useSearch';
import { useMediaQuery } from '@mui/material';
import { Search } from 'component/common/Search/Search';

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

const defaultSort: SortingRule<string> & {
    columns?: string[];
} = { id: 'createdAt' };

export const ProjectFeatureToggles = ({
    features,
    loading,
    environments: newEnvironments = [],
}: IProjectFeatureTogglesProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [strategiesDialogState, setStrategiesDialogState] = useState({
        open: false,
        featureId: '',
        environmentName: '',
    });
    const [featureStaleDialogState, setFeatureStaleDialogState] = useState<{
        featureId?: string;
        stale?: boolean;
    }>({});
    const [featureArchiveState, setFeatureArchiveState] = useState<
        string | undefined
    >();
    const projectId = useRequiredPathParam('projectId');

    const { value: storedParams, setValue: setStoredParams } =
        createLocalStorage(
            `${projectId}:FeatureToggleListTable:v1`,
            defaultSort
        );
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { uiConfig } = useUiConfig();
    const environments = useEnvironmentsRef(
        loading ? ['a', 'b', 'c'] : newEnvironments
    );
    const { refetch } = useProject(projectId);
    const { setToastData, setToastApiError } = useToast();

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
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: FeatureTypeCell,
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Name',
                accessor: 'name',
                Cell: ({ value }: { value: string }) => (
                    <LinkCell
                        title={value}
                        to={`/projects/${projectId}/features/${value}`}
                    />
                ),
                minWidth: 100,
                sortType: 'alphanumeric',
                searchable: true,
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                Cell: DateCell,
                sortType: 'date',
                minWidth: 120,
            },
            ...environments.map(name => ({
                Header: loading ? () => '' : name,
                maxWidth: 90,
                accessor: `environments.${name}`,
                align: 'center',
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
                filterName: name,
                filterParsing: (value: any) =>
                    value.enabled ? 'enabled' : 'disabled',
            })),
            {
                id: 'Actions',
                maxWidth: 56,
                width: 56,
                Cell: (props: { row: { original: ListItemType } }) => (
                    <ActionsCell
                        projectId={projectId}
                        onOpenArchiveDialog={setFeatureArchiveState}
                        onOpenStaleDialog={setFeatureStaleDialogState}
                        {...props}
                    />
                ),
                disableSortBy: true,
            },
        ],
        [projectId, environments, onToggle, loading]
    );

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const featuresData = useMemo(
        () =>
            features.map(
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
            ),
        [features, environments]
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, featuresData);

    const data = useMemo<object[]>(() => {
        if (loading) {
            return Array(6).fill({
                type: '-',
                name: 'Feature name',
                createdAt: new Date(),
                environments: {
                    production: { name: 'production', enabled: false },
                },
            }) as object[];
        }
        return searchedData;
    }, [loading, searchedData]);

    const initialState = useMemo(
        () => {
            const searchParams = new URLSearchParams();
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
                            : storedParams.desc,
                    },
                ],
                hiddenColumns,
            };
        },
        [environments] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const {
        allColumns,
        headerGroups,
        rows,
        state: { sortBy, hiddenColumns },
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            disableSortRemove: true,
            autoResetSortBy: false,
        },
        useFlexLayout,
        useSortBy
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
        if (searchValue) {
            tableState.search = searchValue;
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
        setStoredParams(params => ({
            ...params,
            id: sortBy[0].id,
            desc: sortBy[0].desc || false,
            columns: tableState.columns.split(','),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, sortBy, hiddenColumns, searchValue, setSearchParams]);

    return (
        <PageContent
            isLoading={loading}
            className={styles.container}
            bodyClass={styles.bodyClass}
            header={
                <PageHeader
                    className={styles.title}
                    titleElement={`Feature toggles (${rows.length})`}
                    actions={
                        <>
                            <ConditionallyRender
                                condition={!isSmallScreen}
                                show={
                                    <Search
                                        initialValue={searchValue}
                                        onChange={setSearchValue}
                                        hasFilters
                                        getSearchContext={getSearchContext}
                                    />
                                }
                            />
                            <ColumnsMenu
                                allColumns={allColumns}
                                staticColumns={staticColumns}
                                dividerAfter={['createdAt']}
                                dividerBefore={['Actions']}
                                isCustomized={Boolean(storedParams.columns)}
                                setHiddenColumns={setHiddenColumns}
                            />
                            <PageHeader.Divider sx={{ marginLeft: 0 }} />
                            <ResponsiveButton
                                onClick={() =>
                                    navigate(
                                        getCreateTogglePath(
                                            projectId,
                                            uiConfig.flags.E
                                        )
                                    )
                                }
                                maxWidth="960px"
                                Icon={Add}
                                projectId={projectId}
                                permission={CREATE_FEATURE}
                                className={styles.button}
                            >
                                New feature toggle
                            </ResponsiveButton>
                        </>
                    }
                >
                    <ConditionallyRender
                        condition={isSmallScreen}
                        show={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                </PageHeader>
            }
        >
            <SearchHighlightProvider value={getSearchText(searchValue)}>
                <VirtualizedTable
                    rows={rows}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                />
            </SearchHighlightProvider>
            <ConditionallyRender
                condition={rows.length === 0}
                show={
                    <ConditionallyRender
                        condition={searchValue?.length > 0}
                        show={
                            <TablePlaceholder>
                                No feature toggles found matching &ldquo;
                                {searchValue}
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
            <EnvironmentStrategyDialog
                onClose={() =>
                    setStrategiesDialogState(prev => ({ ...prev, open: false }))
                }
                projectId={projectId}
                {...strategiesDialogState}
            />
            <FeatureStaleDialog
                isStale={featureStaleDialogState.stale === true}
                isOpen={Boolean(featureStaleDialogState.featureId)}
                onClose={() => {
                    setFeatureStaleDialogState({});
                    refetch();
                }}
                featureId={featureStaleDialogState.featureId || ''}
                projectId={projectId}
            />
            <FeatureArchiveDialog
                isOpen={Boolean(featureArchiveState)}
                onConfirm={() => {
                    refetch();
                }}
                onClose={() => {
                    setFeatureArchiveState(undefined);
                }}
                featureId={featureArchiveState || ''}
                projectId={projectId}
            />
        </PageContent>
    );
};
