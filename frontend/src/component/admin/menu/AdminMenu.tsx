import { useLocation } from 'react-router-dom';
import { Paper, styled, Tab, Tabs } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { CenteredNavLink } from './CenteredNavLink';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: '1rem',
    borderRadius: '12.5px',
    boxShadow: 'none',
    padding: '0 2rem',
}));

function AdminMenu() {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { pathname } = useLocation();
    const { isBilling } = useInstanceStatus();
    const { flags } = uiConfig;

    const activeTab = pathname.split('/')[2];

    return (
        <StyledPaper>
            <Tabs
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                <Tab
                    value="users"
                    label={
                        <CenteredNavLink to="/admin/users">
                            <span>Users</span>
                        </CenteredNavLink>
                    }
                />
                {isEnterprise() && (
                    <Tab
                        value="service-accounts"
                        label={
                            <CenteredNavLink to="/admin/service-accounts">
                                <span>Service accounts</span>
                            </CenteredNavLink>
                        }
                    />
                )}
                {flags.UG && (
                    <Tab
                        value="groups"
                        label={
                            <CenteredNavLink to="/admin/groups">
                                <span>Groups</span>
                            </CenteredNavLink>
                        }
                    />
                )}
                {flags.RE && (
                    <Tab
                        value="roles"
                        label={
                            <CenteredNavLink to="/admin/roles">
                                <span>Project roles</span>
                            </CenteredNavLink>
                        }
                    />
                )}
                <Tab
                    value="api"
                    label={
                        <CenteredNavLink to="/admin/api">
                            API access
                        </CenteredNavLink>
                    }
                />
                {uiConfig.flags.embedProxyFrontend && (
                    <Tab
                        value="cors"
                        label={
                            <CenteredNavLink to="/admin/cors">
                                CORS origins
                            </CenteredNavLink>
                        }
                    />
                )}
                <Tab
                    value="auth"
                    label={
                        <CenteredNavLink to="/admin/auth">
                            Single sign-on
                        </CenteredNavLink>
                    }
                />
                <Tab
                    value="instance"
                    label={
                        <CenteredNavLink to="/admin/instance">
                            Instance stats
                        </CenteredNavLink>
                    }
                />
                {flags.networkView && (
                    <Tab
                        value="network"
                        label={
                            <CenteredNavLink to="/admin/network">
                                Network
                            </CenteredNavLink>
                        }
                    />
                )}
                {flags.maintenance && (
                    <Tab
                        value="maintenance"
                        label={
                            <CenteredNavLink to="/admin/maintenance">
                                Maintenance
                            </CenteredNavLink>
                        }
                    />
                )}

                {isBilling && (
                    <Tab
                        value="billing"
                        label={
                            <CenteredNavLink to="/admin/billing">
                                Billing
                            </CenteredNavLink>
                        }
                    />
                )}
            </Tabs>
        </StyledPaper>
    );
}

export default AdminMenu;
