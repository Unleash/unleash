import { Tab, Tabs } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { OidcAuth } from './OidcAuth/OidcAuth';
import { SamlAuth } from './SamlAuth/SamlAuth';
import { ScimSettings } from './ScimSettings/ScimSettings';
import { PasswordAuth } from './PasswordAuth/PasswordAuth';
import { GoogleAuth } from './GoogleAuth/GoogleAuth';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ADMIN, UPDATE_AUTH_CONFIGURATION } from '@server/types/permissions';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { useState } from 'react';
import { TabPanel } from 'component/common/TabNav/TabPanel/TabPanel';
import { usePageTitle } from 'hooks/usePageTitle';

export const AuthSettings = () => {
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
        {
            label: 'SCIM',
            component: <ScimSettings />,
        },
    ].filter(
        (item) => uiConfig.flags?.googleAuthEnabled || item.label !== 'Google',
    );

    const [activeTab, setActiveTab] = useState(0);
    usePageTitle(`Single sign-on: ${tabs[activeTab].label}`);

    if (!isEnterprise()) {
        return <PremiumFeature feature='sso' page />;
    }

    return (
        <div>
            <PermissionGuard permissions={[ADMIN, UPDATE_AUTH_CONFIGURATION]}>
                <PageContent
                    withTabs
                    header={
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
                >
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
                </PageContent>
            </PermissionGuard>
        </div>
    );
};
