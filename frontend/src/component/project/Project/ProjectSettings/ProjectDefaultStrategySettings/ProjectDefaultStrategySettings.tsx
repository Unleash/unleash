import { useContext } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import AccessContext from 'contexts/AccessContext';
import { usePageTitle } from 'hooks/usePageTitle';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import {
    PROJECT_DEFAULT_STRATEGY_READ,
    UPDATE_PROJECT,
} from 'component/providers/AccessProvider/permissions';
import { Alert, styled } from '@mui/material';
import ProjectEnvironment from './ProjectEnvironment/ProjectEnvironment';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import EditDefaultStrategy from './ProjectEnvironment/ProjectEnvironmentDefaultStrategy/EditDefaultStrategy';
import useProjectOverview, {
    useProjectOverviewNameOrId,
} from 'hooks/api/getters/useProjectOverview/useProjectOverview';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));
export const ProjectDefaultStrategySettings = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { hasAccess } = useContext(AccessContext);
    const { project } = useProjectOverview(projectId);
    const navigate = useNavigate();
    usePageTitle(`Project default strategy configuration – ${projectName}`);

    if (
        !hasAccess([UPDATE_PROJECT, PROJECT_DEFAULT_STRATEGY_READ], projectId)
    ) {
        return (
            <PageContent
                header={<PageHeader title='Default Strategy configuration' />}
            >
                <Alert severity='error'>
                    You need project owner permissions to access this section.
                </Alert>
            </PageContent>
        );
    }

    const path = `/projects/${projectId}/settings/default-strategy`;
    const onSidebarClose = () => navigate(path);

    return (
        <>
            <PageContent header={<PageHeader title={`Default Strategy`} />}>
                <StyledAlert severity='info'>
                    Here you can customize your default strategy for each
                    specific environment. These will be used when you enable a
                    toggle environment that has no strategies defined
                </StyledAlert>
                {project?.environments.map((environment) => (
                    <ProjectEnvironment
                        environment={environment}
                        key={environment.environment}
                    />
                ))}
            </PageContent>
            <Routes>
                <Route
                    path='edit'
                    element={
                        <SidebarModal
                            label='Edit feature strategy'
                            onClose={onSidebarClose}
                            open
                        >
                            <EditDefaultStrategy />
                        </SidebarModal>
                    }
                />
            </Routes>
        </>
    );
};
