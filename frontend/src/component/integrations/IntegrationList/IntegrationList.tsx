import { VFC } from 'react';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations';
import { Tab, Tabs, styled, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useUiFlag } from 'hooks/useUiFlag';
import { useIncomingWebhooks } from 'hooks/api/getters/useIncomingWebhooks/useIncomingWebhooks';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TabLink } from 'component/common/TabNav/TabLink';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { ADMIN } from 'component/providers/AccessProvider/permissions';

const StyledHeader = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledTabsContainer = styled('div')({
    flex: 1,
});

const StyledActions = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

export const IntegrationList: VFC = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const incomingWebhooksEnabled = useUiFlag('incomingWebhooks');
    const { providers, addons, loading } = useAddons();
    const { incomingWebhooks } = useIncomingWebhooks();

    const onNewIncomingWebhook = () => {
        navigate('/integrations/incoming-webhooks');
        // TODO: Implement:
        // setSelectedIncomingWebhook(undefined);
        // setIncomingWebhookModalOpen(true);
    };

    const tabs = [
        {
            label: 'Integrations',
            path: '/integrations',
        },
        {
            label: `Incoming webhooks (${incomingWebhooks.length})`,
            path: '/integrations/incoming-webhooks',
        },
    ];

    return (
        <PageContent
            header={
                <ConditionallyRender
                    condition={incomingWebhooksEnabled}
                    show={
                        <StyledHeader>
                            <StyledTabsContainer>
                                <Tabs
                                    value={pathname}
                                    indicatorColor='primary'
                                    textColor='primary'
                                    variant='scrollable'
                                    allowScrollButtonsMobile
                                >
                                    {tabs.map(({ label, path }) => (
                                        <Tab
                                            key={label}
                                            value={path}
                                            label={
                                                <TabLink to={path}>
                                                    {label}
                                                </TabLink>
                                            }
                                            sx={{
                                                padding: 0,
                                            }}
                                        />
                                    ))}
                                </Tabs>
                            </StyledTabsContainer>
                            <StyledActions>
                                <ConditionallyRender
                                    condition={pathname.includes(
                                        'incoming-webhooks',
                                    )}
                                    show={
                                        <ResponsiveButton
                                            onClick={onNewIncomingWebhook}
                                            maxWidth={`${theme.breakpoints.values.sm}px`}
                                            Icon={Add}
                                            permission={ADMIN}
                                        >
                                            New incoming webhook
                                        </ResponsiveButton>
                                    }
                                />
                            </StyledActions>
                        </StyledHeader>
                    }
                    elseShow={<PageHeader title='Integrations' />}
                />
            }
            isLoading={loading}
            withTabs={incomingWebhooksEnabled}
        >
            <Routes>
                <Route
                    path='incoming-webhooks'
                    element={<span>TODO: Implement</span>}
                />
                <Route
                    path='*'
                    element={
                        <>
                            <ConditionallyRender
                                condition={addons.length > 0}
                                show={
                                    <ConfiguredIntegrations
                                        addons={addons}
                                        providers={providers}
                                        loading={loading}
                                    />
                                }
                            />
                            <AvailableIntegrations
                                providers={providers}
                                onNewIncomingWebhook={onNewIncomingWebhook}
                            />
                        </>
                    }
                />
            </Routes>
        </PageContent>
    );
};
