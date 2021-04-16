import React from 'react';
import PropTypes from 'prop-types';
import ApiKeyList from './api-key-list-container';

import AdminMenu from '../admin-menu';
import PageContent from '../../../component/common/PageContent/PageContent';

const render = ({history}) => (
    <div>
        <AdminMenu history={history} />
        <PageContent headerContent="API Access">
            <ApiKeyList />
        </PageContent>
    </div>
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
