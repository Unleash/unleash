import { Alert, Tab, Tabs } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { OidcAuth } from './OidcAuth/OidcAuth';
import { SamlAuth } from './SamlAuth/SamlAuth';
import { ScimSettings } from './ScimSettings/ScimSettings';
import { PasswordAuth } from './PasswordAuth/PasswordAuth';
import { GoogleAuth } from './GoogleAuth/GoogleAuth';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN } from '@server/types/permissions';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useState } from 'react';
import { TabPanel } from 'component/common/TabNav/TabPanel/TabPanel';

export const AuthSettings = () => {
    const { authenticationType } = useUiConfig().uiConfig;
    const { uiConfig, isEnterprise } = useUiConfig();

    const tabs = [
        {
            label: 'OpenID Connect',
            component: <OidcAuth />,
        },
        {
            label: 'SAML 2.0',
            component: <SamlAuth />,
        },
        {
            label: 'Password',
            component: <PasswordAuth />,
        },
        {
            label: 'Google',
            component: <GoogleAuth />,
        },
    ].filter(
        (item) => uiConfig.flags?.googleAuthEnabled || item.label !== 'Google',
    );

    if (isEnterprise()) {
        tabs.push({
            label: 'SCIM',
            component: <ScimSettings />,
        });
    }

    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <PermissionGuard permissions={ADMIN}>
                <PageContent
                    withTabs
                    header={
                        <ConditionallyRender
                            condition={authenticationType === 'enterprise'}
                            show={
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, tabId) => {
                                        setActiveTab(tabId);
                                    }}
                                    indicatorColor='primary'
                                    textColor='primary'
                                >
                                    {tabs.map((tab, index) => (
                                        <Tab
                                            key={`${tab.label}_${index}`}
                                            label={tab.label}
                                            id={`tab-${index}`}
                                            aria-controls={`tabpanel-${index}`}
                                            sx={{
                                                minWidth: {
                                                    lg: 160,
                                                },
                                            }}
                                        />
                                    ))}
                                </Tabs>
                            }
                        />
                    }
                >
                    <ConditionallyRender
                        condition={authenticationType === 'open-source'}
                        show={<PremiumFeature feature='sso' />}
                    />
                    <ConditionallyRender
                        condition={authenticationType === 'demo'}
                        show={
                            <Alert severity='warning'>
                                You are running Unleash in demo mode. You have
                                to use the Enterprise edition in order configure
                                Single Sign-on.
                            </Alert>
                        }
                    />
                    <ConditionallyRender
                        condition={authenticationType === 'custom'}
                        show={
                            <Alert severity='warning'>
                                You have decided to use custom authentication
                                type. You have to use the Enterprise edition in
                                order configure Single Sign-on from the user
                                interface.
                            </Alert>
                        }
                    />
                    <ConditionallyRender
                        condition={authenticationType === 'hosted'}
                        show={
                            <Alert severity='info'>
                                Your Unleash instance is managed by the Unleash
                                team.
                            </Alert>
                        }
                    />
                    <ConditionallyRender
                        condition={authenticationType === 'enterprise'}
                        show={
                            <div>
                                {tabs.map((tab, index) => (
                                    <TabPanel
                                        key={index}
                                        value={activeTab}
                                        index={index}
                                    >
                                        {tab.component}
                                    </TabPanel>
                                ))}
                            </div>
                        }
                    />
                </PageContent>
            </PermissionGuard>
        </div>
    );
};
