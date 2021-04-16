import React from 'react';
import PropTypes from 'prop-types';
import AdminMenu from '../admin-menu';
import { Alert } from '@material-ui/lab';
import GoogleAuth from './google-auth-container';
import SamlAuth from './saml-auth-container';
import TabNav from '../../../component/common/TabNav/TabNav';
import PageContent from '../../../component/common/PageContent/PageContent';
import ConditionallyRender from '../../../component/common/ConditionallyRender/ConditionallyRender';

function AdminAuthPage({ authenticationType, history }) {
    const tabs = [
        {
            label: 'SAML 2.0',
            component: <SamlAuth />,
        },
        {
            label: 'Google',
            component: <GoogleAuth />,
        },
    ];

    return (
        <div>
            <AdminMenu history={history} />
            <PageContent headerContent="Authentication">
                <ConditionallyRender condition={authenticationType === 'enterprise'}
                    show={
                        <TabNav tabData={tabs} />
                    }
                />
                <ConditionallyRender condition={authenticationType === 'open-source'}
                    show={
                        <Alert severity="warning">
                            You are running the open-source version of Unleash. You have to use the Enterprise edition 
                            in order configure Single Sign-on.</Alert>
                    }
                />
                <ConditionallyRender condition={authenticationType === 'custom'}
                    show={
                        <Alert severity="warning">You have decided to use custom authentication type. You have to use the Enterprise edition 
                            in order configure Single Sign-on from the user interface.</Alert>
                    }
                />
            </PageContent>
        </div>
    );
}

AdminAuthPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    authenticationType: PropTypes.string,
};

export default AdminAuthPage;
