import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'react-mdl';
import AdminMenu from '../admin-menu';
import GoogleAuth from './google-auth-container';
import SamlAuth from './saml-auth-container';

function AdminAuthPage() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <AdminMenu />
            <h3>Authentication</h3>
            <div className="demo-tabs">
                <Tabs activeTab={activeTab} onChange={setActiveTab} ripple>
                    <Tab>SAML 2.0</Tab>
                    <Tab>Google</Tab>
                </Tabs>
                <section>{activeTab === 0 ? <SamlAuth /> : <GoogleAuth />}</section>
            </div>
        </div>
    );
}

AdminAuthPage.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default AdminAuthPage;
