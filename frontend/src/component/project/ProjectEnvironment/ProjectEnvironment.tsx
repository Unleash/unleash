import { useMemo, useState } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { UPDATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import ApiError from 'component/common/ApiError/ApiError';
import useToast from 'hooks/useToast';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useProject, {
    useProjectNameOrId,
} from 'hooks/api/getters/useProject/useProject';
import { Alert, styled, TableBody, TableRow } from '@mui/material';
import useProjectApi from 'hooks/api/actions/useProjectApi/useProjectApi';
import { Link } from 'react-router-dom';
import PermissionSwitch from 'component/common/PermissionSwitch/PermissionSwitch';
import { IProjectEnvironment } from 'interfaces/environments';
import { getEnabledEnvs } from './helpers';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useTable, useGlobalFilter } from 'react-table';
import {
    SortableTableHeader,
    Table,
    TableCell,
    TablePlaceholder,
} from 'component/common/Table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Search } from 'component/common/Search/Search';
import { EnvironmentNameCell } from 'component/environments/EnvironmentTable/EnvironmentNameCell/EnvironmentNameCell';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { EnvironmentHideDialog } from './EnvironmentHideDialog/EnvironmentHideDialog';
import { useProjectEnvironments } from 'hooks/api/getters/useProjectEnvironments/useProjectEnvironments';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';

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
    const projectName = useProjectNameOrId(projectId);
    usePageTitle(`Project environments – ${projectName}`);

    // api state
    const { setToastData, setToastApiError } = useToast();
    const { environments, loading, error, refetchEnvironments } =
        useProjectEnvironments(projectId);
    const { project, refetch: refetchProject } = useProject(projectId);
    const { removeEnvironmentFromProject, addEnvironmentToProject } =
        useProjectApi();

    // local state
    const [selectedEnvironment, setSelectedEnvironment] =
        useState<IProjectEnvironment>();
    const [hideDialog, setHideDialog] = useState(false);
    const { isOss } = useUiConfig();

    const projectEnvironments = useMemo<IProjectEnvironment[]>(
        () =>
            environments.map(environment => ({
                ...environment,
                projectVisible: project?.environments
                    .map(projectEnvironment => projectEnvironment.environment)
                    .includes(environment.name),
            })),
        [environments, project?.environments]
    );

    const refetch = () => {
        refetchEnvironments();
        refetchProject();
    };

    const renderError = () => {
        return (
            <StyledApiError
                onClick={refetch}
                text="Error fetching environments"
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
                title: 'One environment must be visible',
                text: 'You must always have at least one visible environment per project',
                type: 'error',
            });
        } else {
            try {
                await addEnvironmentToProject(projectId, env.name);
                refetch();
                setToastData({
                    title: 'Environment set as visible',
                    text: 'Environment successfully set as visible.',
                    type: 'success',
                });
            } catch (error) {
                setToastApiError(errorMsg(true));
            }
        }
    };

    const onHideConfirm = async () => {
        if (selectedEnvironment) {
            try {
                await removeEnvironmentFromProject(
                    projectId,
                    selectedEnvironment.name
                );
                refetch();
                setToastData({
                    title: 'Environment set as hidden',
                    text: 'Environment successfully set as hidden.',
                    type: 'success',
                });
            } catch (e) {
                setToastApiError(errorMsg(false));
            } finally {
                setHideDialog(false);
            }
        }
    };

    const envIsDisabled = (projectName: string) => {
        return isOss() && projectName === 'default';
    };

    const COLUMNS = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: ({ row: { original } }: any) => (
                    <EnvironmentNameCell environment={original} />
                ),
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: HighlightCell,
            },
            {
                Header: 'Project API tokens',
                accessor: (row: IProjectEnvironment) =>
                    row.projectApiTokenCount === 1
                        ? '1 token'
                        : `${row.projectApiTokenCount} tokens`,
                Cell: TextCell,
            },
            {
                Header: 'Visible in project',
                accessor: 'enabled',
                align: 'center',
                width: 1,
                Cell: ({ row: { original } }: any) => (
                    <ActionCell>
                        <PermissionSwitch
                            tooltip={
                                original.projectVisible
                                    ? 'Hide environment and disable feature toggles'
                                    : 'Make it visible'
                            }
                            size="medium"
                            disabled={envIsDisabled(original.name)}
                            projectId={projectId}
                            permission={UPDATE_PROJECT}
                            checked={original.projectVisible}
                            onChange={() => toggleEnv(original)}
                        />
                    </ActionCell>
                ),
                disableGlobalFilter: true,
            },
        ],
        [projectEnvironments]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns: COLUMNS as any,
            data: projectEnvironments,
            disableSortBy: true,
        },
        useGlobalFilter
    );

    const header = (
        <PageHeader
            title={`Environments (${rows.length})`}
            actions={
                <Search
                    initialValue={globalFilter}
                    onChange={setGlobalFilter}
                />
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
                <StyledAlert severity="info">
                    <strong>Important!</strong> In order for your application to
                    retrieve configured activation strategies for a specific
                    environment, the application must use an environment
                    specific API token. You can look up the environment-specific{' '}
                    <Link to="/admin/api">API tokens here</Link>.
                    <br />
                    <br />
                    Your administrator can configure an environment-specific API
                    token to be used in the SDK. If you are an administrator you
                    can <Link to="/admin/api">create a new API token here</Link>
                    .
                </StyledAlert>
                <SearchHighlightProvider value={globalFilter}>
                    <Table {...getTableProps()} rowHeight="compact">
                        <SortableTableHeader
                            headerGroups={headerGroups as any}
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
