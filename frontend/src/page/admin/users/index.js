import React from 'react';
import PropTypes from 'prop-types';
import UsersList from './UsersList';
import AdminMenu from '../admin-menu';
import PageContent from '../../../component/common/PageContent/PageContent';

const render = ({history}) => (
    <div>
        <AdminMenu history={history} />
        <PageContent headerContent="Users">
            <UsersList />
        </PageContent>
    </div>
);

render.propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default render;
