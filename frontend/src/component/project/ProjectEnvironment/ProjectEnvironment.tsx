import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import ApiError from 'component/common/ApiError/ApiError';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { Alert, styled, TableBody, TableRow, Link } from '@mui/material';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import type { IProjectEnvironment } from 'interfaces/environments';
import { getEnabledEnvs } from './helpers.ts';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TableCell, TablePlaceholder } from 'component/common/Table';
import { SortableTableHeader } from 'component/common/Table/SortableTableHeader/SortableTableHeader';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Search } from 'component/common/Search/Search';
import { EnvironmentNameCell } from 'component/environments/EnvironmentTable/EnvironmentNameCell/EnvironmentNameCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { EnvironmentHideDialog } from './EnvironmentHideDialog/EnvironmentHideDialog.tsx';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { UpgradeMoreEnvironments } from './UpgradeMoreEnvironments.tsx';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

const StyledDivContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
}));

const StyledApiError = styled(ApiError)(({ theme }) => ({
    maxWidth: '400px',
    marginBottom: theme.spacing(2),
}));

const ProjectEnvironmentList = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    usePageTitle(`Project environments – ${projectName}`);

    // api state
    const { setToastData, setToastApiError } = useToast();
    const { environments, loading, error, refetchEnvironments } =
        useProjectEnvironments(projectId);
    const { project, refetch: refetchProject } = useProjectOverview(projectId);
    const { removeEnvironmentFromProject, addEnvironmentToProject } =
        useProjectApi();

    // local state
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IProjectEnvironment>();
    const [hideDialog, setHideDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const { isOss } = useUiConfig();

    const projectEnvironments = useMemo<IProjectEnvironment[]>(
        () =>
            environments.map((environment) => ({
                ...environment,
                projectVisible: project?.environments
                    ?.map(
                        (projectEnvironment) => projectEnvironment.environment,
                    )
                    .includes(environment.name),
            })),
        [environments, project?.environments],
    );

    const refetch = () => {
        refetchEnvironments();
        refetchProject();
    };

    const renderError = () => {
        return (
            <StyledApiError
                onClick={refetch}
                text='Error fetching environments'
            />
        );
    };

    const errorMsg = (enable: boolean): string => {
        return `Got an API error when trying to set the environment as ${
            enable ? 'visible' : 'hidden'
        }`;
    };

    const toggleEnv = async (env: IProjectEnvironment) => {
        if (env.projectVisible) {
            const enabledEnvs = getEnabledEnvs(projectEnvironments);

            if (enabledEnvs > 1) {
                setSelectedEnvironment(env);
                setHideDialog(true);
                return;
            }
            setToastData({
                text: 'At least one environment must be visible in the project',
                type: 'error',
            });
        } else {
            try {
                await addEnvironmentToProject(projectId, env.name);
                refetch();
                setToastData({
                    text: 'Environment set as visible',
                    type: 'success',
                });
            } catch (_error) {
                setToastApiError(errorMsg(true));
            }
        }
    };

    const onHideConfirm = async () => {
        if (selectedEnvironment) {
            try {
                await removeEnvironmentFromProject(
                    projectId,
                    selectedEnvironment.name,
                );
                refetch();
                setToastData({
                    text: 'Environment hidden',
                    type: 'success',
                });
            } catch (_e) {
                setToastApiError(errorMsg(false));
            } finally {
                setHideDialog(false);
            }
        }
    };

    const envIsDisabled = (env: IProjectEnvironment) => {
        return (
            (isOss() && env.name === 'default') ||
            (env.projectVisible && onlyOneEnvEnabled())
        );
    };

    const onlyOneEnvEnabled = (): boolean => {
        return (
            projectEnvironments.filter((env) => env.projectVisible).length === 1
        );
    };

    const buildToolTip = (env: IProjectEnvironment): string => {
        if (env.projectVisible && onlyOneEnvEnabled()) {
            return 'Cannot disable, at least one environment must be visible in the project';
        }
        return env.projectVisible
            ? 'Hide environment and disable feature flags'
            : 'Make it visible';
    };

    const columns = useMemo<ColumnDef<IProjectEnvironment, unknown>[]>(
        () => [
            {
                id: 'name',
                header: 'Name',
                accessorKey: 'name',
                cell: ({ row: { original } }) => (
                    <EnvironmentNameCell environment={original} />
                ),
            },
            {
                id: 'type',
                header: 'Type',
                accessorKey: 'type',
                cell: HighlightCell,
            },
            {
                id: 'projectApiTokenCount',
                header: 'Project API tokens',
                accessorFn: (row) =>
                    row.projectApiTokenCount === 1
                        ? '1 token'
                        : `${row.projectApiTokenCount} tokens`,
                cell: TextCell,
            },
            {
                id: 'enabled',
                header: 'Visible in project',
                accessorKey: 'enabled',
                cell: ({ row: { original } }) => (
                    <ActionCell>
                        <PermissionSwitch
                            tooltip={buildToolTip(original)}
                            size='medium'
                            disabled={envIsDisabled(original)}
                            projectId={projectId}
                            permission={UPDATE_PROJECT}
                            checked={Boolean(original.projectVisible)}
                            onChange={() => toggleEnv(original)}
                        />
                    </ActionCell>
                ),
                enableGlobalFilter: false,
                meta: { align: 'center' },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [projectEnvironments],
    );

    const table = useReactTable({
        columns,
        data: projectEnvironments,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableSorting: false,
        autoResetAll: false,
    });

    const rows = table.getRowModel().rows;

    const header = (
        <PageHeader
            title={`Environments (${rows.length})`}
            actions={
                <>
                    <Search
                        initialValue={globalFilter}
                        onChange={(value) => setGlobalFilter(value)}
                    />
                    {!isOss() ? (
                        <>
                            <PageHeader.Divider />
                            <Link component={RouterLink} to='/environments'>
                                Configure environments
                            </Link>
                        </>
                    ) : null}
                </>
            }
        />
    );

    return (
        <PageContent header={header} isLoading={loading}>
            <StyledDivContainer>
                <ConditionallyRender
                    condition={Boolean(error)}
                    show={renderError()}
                />
                <StyledAlert severity='info'>
                    <strong>Important!</strong> In order for your application to
                    retrieve configured activation strategies for a specific
                    environment, the application must use an environment
                    specific API token. You can look up the environment-specific{' '}
                    <RouterLink to='/admin/api'>API tokens here</RouterLink>.
                    <br />
                    <br />
                    Your administrator can configure an environment-specific API
                    token to be used in the SDK. If you are an administrator you
                    can{' '}
                    <RouterLink to='/admin/api'>
                        create a new API token here
                    </RouterLink>
                    .
                </StyledAlert>
                <SearchHighlightProvider value={globalFilter}>
                    <Table rowHeight='compact'>
                        <SortableTableHeader tableInstance={table} />
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow hover key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
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
                                    No environments found matching &ldquo;
                                    {globalFilter}
                                    &rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    No environments available. Get started by
                                    adding one.
                                </TablePlaceholder>
                            }
                        />
                    }
                />
                {isOss() ? <UpgradeMoreEnvironments /> : null}
                <EnvironmentHideDialog
                    environment={selectedEnvironment}
                    open={hideDialog}
                    setOpen={setHideDialog}
                    onConfirm={onHideConfirm}
                />
            </StyledDivContainer>
        </PageContent>
    );
};

export default ProjectEnvironmentList;
