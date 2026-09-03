import { Alert } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { Link, Route, Routes, useNavigate } from 'react-router';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { CreateIntegration } from 'component/integrations/CreateIntegration/CreateIntegration';
import { EditIntegration } from 'component/integrations/EditIntegration/EditIntegration';
import { ConfiguredIntegrations } from 'component/integrations/IntegrationList/ConfiguredIntegrations/ConfiguredIntegrations';
import {
    formatIntegrationCreatePath,
    formatIntegrationListPath,
} from 'component/integrations/integrationPaths';

const PROJECT_INTEGRATION_PROVIDER = 'slack-app';

export const ProjectIntegrations = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();
    const { addons, providers, loading, error } = useAddons();

    usePageTitle(`Project integrations – ${projectName}`);

    const projectAddons = addons.filter(
        (addon) =>
            addon.provider === PROJECT_INTEGRATION_PROVIDER &&
            addon.projects?.length === 1 &&
            addon.projects[0] === projectId,
    );

    const createPath = formatIntegrationCreatePath(
        PROJECT_INTEGRATION_PROVIDER,
        projectId,
    );
    const closeModal = () => navigate(formatIntegrationListPath(projectId));

    const renderIntegrations = () => {
        if (error) {
            return (
                <Alert severity='error'>
                    Could not load the integrations for this project.
                </Alert>
            );
        }

        if (projectAddons.length > 0) {
            return (
                <ConfiguredIntegrations
                    addons={projectAddons}
                    providers={providers}
                    loading={loading}
                />
            );
        }

        if (loading) {
            return null;
        }

        return (
            <Alert severity='info'>
                This project has no Slack integrations yet. Add one to send this
                project's events to Slack. Integrations that are instance-wide
                or shared with other projects are managed on the{' '}
                <Link to='/integrations'>integrations page</Link>.
            </Alert>
        );
    };

    return (
        <PageContent
            header={
                <PageHeader
                    title='Integrations'
                    actions={
                        <ResponsiveButton
                            Icon={Add}
                            onClick={() => navigate(createPath)}
                            maxWidth='700px'
                            permission={CREATE_ADDON}
                        >
                            New Slack integration
                        </ResponsiveButton>
                    }
                />
            }
            isLoading={loading}
        >
            {renderIntegrations()}

            <Routes>
                <Route
                    path='create/:providerId'
                    element={
                        <SidebarModal
                            open
                            onClose={closeModal}
                            label='Create integration'
                        >
                            <CreateIntegration modal />
                        </SidebarModal>
                    }
                />
                <Route
                    path='edit/:addonId'
                    element={
                        <SidebarModal
                            open
                            onClose={closeModal}
                            label='Edit integration'
                        >
                            <EditIntegration modal />
                        </SidebarModal>
                    }
                />
            </Routes>
        </PageContent>
    );
};
