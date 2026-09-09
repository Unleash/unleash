import { Alert, Typography, styled } from '@mui/material';
import { Route, Routes, useNavigate } from 'react-router';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { CreateIntegration } from 'component/integrations/CreateIntegration/CreateIntegration';
import { EditIntegration } from 'component/integrations/EditIntegration/EditIntegration';
import { IntegrationProviderCards } from 'component/integrations/IntegrationList/AvailableIntegrations/IntegrationProviderCards';
import { ConfiguredIntegrations } from 'component/integrations/IntegrationList/ConfiguredIntegrations/ConfiguredIntegrations';
import { StyledCardsGrid } from 'component/integrations/IntegrationList/IntegrationList.styles';
import { formatIntegrationListPath } from 'component/integrations/integrationPaths';

const StyledSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

export const ProjectIntegrations = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();
    const { addons, providers, loading, error } = useAddons();

    usePageTitle(`Project integrations – ${projectName}`);

    const availableProviders = providers.filter(
        (provider) => !provider.deprecated,
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

        if (addons.length > 0) {
            return (
                <ConfiguredIntegrations
                    addons={addons}
                    providers={providers}
                    loading={loading}
                />
            );
        }

        if (loading) {
            return null;
        }

        return (
            <Alert severity='info' sx={{ mb: 3 }}>
                This project has no integrations yet.
            </Alert>
        );
    };

    return (
        <PageContent
            header={<PageHeader title='Integrations' />}
            isLoading={loading}
        >
            {renderIntegrations()}

            <StyledSection>
                <div>
                    <Typography component='h3' variant='h2'>
                        Available integrations
                    </Typography>
                    <Typography
                        variant='body2'
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        Add an integration to send this project's events to
                        another service.
                    </Typography>
                </div>
                <StyledCardsGrid>
                    <IntegrationProviderCards
                        providers={availableProviders}
                        projectId={projectId}
                    />
                </StyledCardsGrid>
            </StyledSection>

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
