import { useContext } from 'react';
import { PageContent } from 'component/common/PageContent/PageContent';
import { Alert } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import AccessContext from 'contexts/AccessContext';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectNameOrId } from 'hooks/api/getters/useProject/useProject';
import { CreateProjectApiToken } from 'component/project/Project/ProjectSettings/ProjectApiAccess/CreateProjectApiToken';
import { Routes, Route } from 'react-router-dom';
import { ApiTokenTable } from 'component/common/ApiTokenTable/ApiTokenTable';
import { useProjectApiTokens } from 'hooks/api/getters/useProjectApiTokens/useProjectApiTokens';
import { CreateApiTokenButton } from 'component/common/ApiTokenTable/CreateApiTokenButton/CreateApiTokenButton';
import { useApiTokenTable } from 'component/common/ApiTokenTable/useApiTokenTable';
import { Search } from 'component/common/Search/Search';
import {
    CREATE_PROJECT_API_TOKEN,
    DELETE_PROJECT_API_TOKEN,
    READ_PROJECT_API_TOKEN,
} from '@server/types/permissions';
import { CopyApiTokenButton } from 'component/common/ApiTokenTable/CopyApiTokenButton/CopyApiTokenButton';
import { RemoveApiTokenButton } from 'component/common/ApiTokenTable/RemoveApiTokenButton/RemoveApiTokenButton';
import { ActionCell } from 'component/common/Table/cells/ActionCell/ActionCell';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import useProjectApiTokensApi from 'hooks/api/actions/useProjectApiTokensApi/useProjectApiTokensApi';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const ProjectApiAccess = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const {
        tokens,
        loading,
        refetch: refetchProjectTokens,
    } = useProjectApiTokens(projectId);
    const { trackEvent } = usePlausibleTracker();
    const { deleteToken: deleteProjectToken } = useProjectApiTokensApi();

    usePageTitle(`Project api access – ${projectName}`);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state: { globalFilter },
        setGlobalFilter,
        setHiddenColumns,
        columns,
    } = useApiTokenTable(tokens, props => (
        <ActionCell>
            <CopyApiTokenButton
                token={props.row.original}
                permission={READ_PROJECT_API_TOKEN}
                project={projectId}
                track={() =>
                    trackEvent('project_api_tokens', {
                        props: { eventType: 'api_key_copied' },
                    })
                }
            />
            <RemoveApiTokenButton
                token={props.row.original}
                permission={DELETE_PROJECT_API_TOKEN}
                project={projectId}
                onRemove={async () => {
                    await deleteProjectToken(
                        props.row.original.secret,
                        projectId
                    );
                    trackEvent('project_api_tokens', {
                        props: { eventType: 'api_key_deleted' },
                    });
                    refetchProjectTokens();
                }}
            />
        </ActionCell>
    ));

    return (
        <div style={{ width: '100%', overflow: 'hidden' }}>
            <PageContent
                header={
                    <PageHeader
                        title={`API access (${rows.length})`}
                        actions={
                            <>
                                <Search
                                    initialValue={globalFilter}
                                    onChange={setGlobalFilter}
                                />
                                <PageHeader.Divider />
                                <CreateApiTokenButton
                                    permission={CREATE_PROJECT_API_TOKEN}
                                    path="create"
                                    project={projectId}
                                />
                            </>
                        }
                    />
                }
            >
                <ConditionallyRender
                    condition={!hasAccess(READ_PROJECT_API_TOKEN, projectId)}
                    show={
                        <Alert severity="warning">
                            You need to have the correct permissions to read API
                            tokens
                        </Alert>
                    }
                    elseShow={
                        <ApiTokenTable
                            compact
                            loading={loading}
                            headerGroups={headerGroups}
                            setHiddenColumns={setHiddenColumns}
                            prepareRow={prepareRow}
                            getTableBodyProps={getTableBodyProps}
                            getTableProps={getTableProps}
                            rows={rows}
                            columns={columns}
                            globalFilter={globalFilter}
                        />
                    }
                />
            </PageContent>

            <Routes>
                <Route path="create" element={<CreateProjectApiToken />} />
            </Routes>
        </div>
    );
};
