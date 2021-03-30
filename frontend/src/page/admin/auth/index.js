import React from 'react';
import PropTypes from 'prop-types';
import AdminMenu from '../admin-menu';
import GoogleAuth from './google-auth-container';
import SamlAuth from './saml-auth-container';
import TabNav from '../../../component/common/TabNav/TabNav';
import PageContent from '../../../component/common/PageContent/PageContent';

function AdminAuthPage() {
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
            <AdminMenu />
            <PageContent headerContent="Authentication">
                <TabNav tabData={tabs} />
            </PageContent>
        </div>
    );
}

AdminAuthPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default AdminAuthPage;
