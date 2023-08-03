import { useLocation } from 'react-router-dom';
import { Paper, styled, Tab, Tabs } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { CenteredNavLink } from './CenteredNavLink';
import { VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: '1rem',
    borderRadius: '12.5px',
    boxShadow: 'none',
    padding: '0 2rem',
}));

export const AdminTabsMenu: VFC = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { pathname } = useLocation();
    const { isBilling } = useInstanceStatus();
    const { flags, networkViewEnabled } = uiConfig;

    const activeTab = pathname.split('/')[2];

    const showEnterpriseFeaturesInPro =
        uiConfig?.flags?.frontendNavigationUpdate;

    const tabs = [
        {
            value: 'users',
            label: 'Users',
            link: '/admin/users',
        },
        {
            value: 'service-accounts',
            label: 'Service accounts',
            link: '/admin/service-accounts',
            condition: isEnterprise() || showEnterpriseFeaturesInPro,
            isEnterprise: true,
        },
        {
            value: 'groups',
            label: 'Groups',
            link: '/admin/groups',
            condition: flags.UG,
        },
        {
            value: 'roles',
            label: 'Roles',
            link: '/admin/roles',
            condition: isEnterprise() || showEnterpriseFeaturesInPro,
        },
        {
            value: 'api',
            label: 'API access',
            link: '/admin/api',
        },
        {
            value: 'cors',
            label: 'CORS origins',
            link: '/admin/cors',
            condition: uiConfig.flags.embedProxyFrontend,
        },
        {
            value: 'auth',
            label: 'Single sign-on',
            link: '/admin/auth',
        },
        {
            value: 'instance',
            label: 'Instance stats',
            link: '/admin/instance',
        },
        {
            value: 'network',
            label: 'Network',
            link: '/admin/network',
            condition: networkViewEnabled,
        },
        {
            value: 'maintenance',
            label: 'Maintenance',
            link: '/admin/maintenance',
        },
        {
            value: 'instance-privacy',
            label: 'Instance privacy',
            link: '/admin/instance-privacy',
        },
        {
            value: 'billing',
            label: 'Billing',
            link: '/admin/billing',
            condition: isBilling,
        },
    ];

    return (
        <StyledPaper>
            <Tabs
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {tabs
                    .filter(tab => tab.condition || tab.condition === undefined)
                    .map(tab => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={
                                <CenteredNavLink to={tab.link}>
                                    {tab.label}
                                    <ConditionallyRender
                                        condition={Boolean(tab.isEnterprise)}
                                        show={<EnterpriseBadge />}
                                    />
                                </CenteredNavLink>
                            }
                        />
                    ))}
            </Tabs>
        </StyledPaper>
    );
};
