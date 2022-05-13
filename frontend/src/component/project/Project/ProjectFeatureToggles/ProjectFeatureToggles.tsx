import { useCallback, useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
import { FeatureLinkCell } from 'component/common/Table/cells/FeatureLinkCell/FeatureLinkCell';
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
import useToast from 'hooks/useToast';
import { ENVIRONMENT_STRATEGY_ERROR } from 'constants/apiErrors';
import EnvironmentStrategyDialog from 'component/common/EnvironmentStrategiesDialog/EnvironmentStrategyDialog';
import { useEnvironmentsRef } from './hooks/useEnvironmentsRef';
import { useSetFeatureState } from './hooks/useSetFeatureState';
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
    const environments = useEnvironmentsRef(newEnvironments);
    const { refetch } = useProject(projectId);
    const { setToastData, setToastApiError } = useToast();

    const data = useMemo<ListItemType[]>(() => {
        if (loading) {
            return Array(12).fill({
                type: '-',
                name: 'Feature name',
                createdAt: new Date(),
                environments: {
                    production: { name: 'production', enabled: false },
                },
            }) as ListItemType[];
        }

        return features.map(
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

    const { setFeatureState } = useSetFeatureState();
    const onToggle = useCallback(
        async (
            projectId: string,
            featureName: string,
            environment: string,
            enabled: boolean
        ) => {
            try {
                await setFeatureState(
                    projectId,
                    featureName,
                    environment,
                    enabled
                );
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
        [setFeatureState] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: FeatureSeenCell,
                sortType: 'date',
                align: 'center',
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: FeatureTypeCell,
                align: 'center',
            },
            {
                Header: 'Feature toggle name',
                accessor: 'name',
                Cell: ({ value }: { value: string }) => (
                    <FeatureLinkCell
                        title={value}
                        to={`/projects/${projectId}/features/${value}`}
                    />
                ),
                width: '99%',
                minWdith: 100,
                sortType: 'alphanumeric',
            },
            {
                Header: 'Created on',
                accessor: 'createdAt',
                Cell: DateCell,
                sortType: 'date',
                align: 'center',
            },
            ...environments.map(name => ({
                Header: name,
                maxWidth: 103,
                minWidth: 103,
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
            })),
            {
                Header: ({ allColumns, setHiddenColumns }: any) => (
                    <ColumnsMenu
                        allColumns={allColumns}
                        staticColumns={['actions', 'name']}
                        dividerAfter={['createdAt']}
                        dividerBefore={['actions']}
                        setHiddenColumns={setHiddenColumns}
                    />
                ),
                maxWidth: 60,
                width: 60,
                id: 'actions',
                Cell: (props: { row: { original: ListItemType } }) => (
                    <ActionsCell projectId={projectId} {...props} />
                ),
                disableSortBy: true,
            },
        ],
        [projectId, environments, onToggle]
    );

    const initialState = useMemo(
        () => ({
            sortBy: [{ id: 'createdAt', desc: false }],
            hiddenColumns: environments
                .filter((_, index) => index >= 3)
                .map(environment => `environments.${environment}`),
        }),
        [environments]
    );

    const {
        state: { filters },
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setFilter,
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
        () => filters?.find(filterRow => filterRow?.id === 'name')?.value || '',
        [filters]
    );

    return (
        <PageContent
            isLoading={loading}
            className={styles.container}
            bodyClass={styles.bodyClass}
            header={
                <PageHeader
                    className={styles.title}
                    title={`Project feature toggles (${rows.length})`}
                    actions={
                        <>
                            <TableSearch
                                initialValue={filter}
                                onChange={value => setFilter('name', value)}
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
