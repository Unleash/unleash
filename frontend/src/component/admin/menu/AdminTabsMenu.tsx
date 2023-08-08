import { useLocation } from 'react-router-dom';
import { Paper, styled, Tab, Tabs } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { CenteredNavLink } from './CenteredNavLink';
import { VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { EnterpriseBadge } from 'component/common/EnterpriseBadge/EnterpriseBadge';
import { useAdminRoutes } from '../useAdminRoutes';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: '1rem',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    padding: theme.spacing(0, 2),
}));

const StyledBadgeContainer = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
}));

export const AdminTabsMenu: VFC = () => {
    const { uiConfig, isPro } = useUiConfig();
    const { pathname } = useLocation();

    const activeTab = pathname.split('/')[2];

    const showEnterpriseFeaturesInPro =
        uiConfig?.flags?.frontendNavigationUpdate;

    const adminRoutes = useAdminRoutes();
    const group = adminRoutes.find(route => route.path === pathname)?.group;

    const tabs = adminRoutes.filter(route => !group || route.group === group);

    if (!group) {
        return null;
    }

    return (
        <StyledPaper>
            <Tabs
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {tabs.map(tab => (
                    <Tab
                        key={tab.route}
                        value={tab.route?.split('/')?.[2]}
                        label={
                            <CenteredNavLink to={tab.path}>
                                {tab.title}
                                <ConditionallyRender
                                    condition={Boolean(
                                        tab.menu.mode?.includes('enterprise') &&
                                            !tab.menu.mode?.includes('pro') &&
                                            isPro() &&
                                            showEnterpriseFeaturesInPro
                                    )}
                                    show={
                                        <StyledBadgeContainer>
                                            <EnterpriseBadge size={16} />
                                        </StyledBadgeContainer>
                                    }
                                />
                            </CenteredNavLink>
                        }
                    />
                ))}
            </Tabs>
        </StyledPaper>
    );
};
