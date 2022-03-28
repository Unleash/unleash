import React from 'react';
import AdminMenu from '../menu/AdminMenu';
import { Alert } from '@material-ui/lab';
import TabNav from 'component/common/TabNav/TabNav';
import PageContent from 'component/common/PageContent/PageContent';
import ConditionallyRender from 'component/common/ConditionallyRender/ConditionallyRender';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { OidcAuth } from './OidcAuth/OidcAuth';
import { SamlAuth } from './SamlAuth/SamlAuth';
import { PasswordAuth } from './PasswordAuth/PasswordAuth';
import { GoogleAuth } from './GoogleAuth/GoogleAuth';

export const AuthSettings = () => {
    const { authenticationType } = useUiConfig().uiConfig;

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
    ];

    return (
        <div>
            <AdminMenu />
            <PageContent headerContent="Single Sign-On">
                <ConditionallyRender
                    condition={authenticationType === 'enterprise'}
                    show={<TabNav tabData={tabs} />}
                />
                <ConditionallyRender
                    condition={authenticationType === 'open-source'}
                    show={
                        <Alert severity="warning">
                            You are running the open-source version of Unleash.
                            You have to use the Enterprise edition in order
                            configure Single Sign-on.
                        </Alert>
                    }
                />
                <ConditionallyRender
                    condition={authenticationType === 'demo'}
                    show={
                        <Alert severity="warning">
                            You are running Unleash in demo mode. You have to
                            use the Enterprise edition in order configure Single
                            Sign-on.
                        </Alert>
                    }
                />
                <ConditionallyRender
                    condition={authenticationType === 'custom'}
                    show={
                        <Alert severity="warning">
                            You have decided to use custom authentication type.
                            You have to use the Enterprise edition in order
                            configure Single Sign-on from the user interface.
                        </Alert>
                    }
                />
                <ConditionallyRender
                    condition={authenticationType === 'hosted'}
                    show={
                        <Alert severity="info">
                            Your Unleash instance is managed by the Unleash
                            team.
                        </Alert>
                    }
                />
            </PageContent>
        </div>
    );
};
