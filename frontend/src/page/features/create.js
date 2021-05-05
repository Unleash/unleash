import React from 'react';
import CreateFeature from '../../component/feature/create/CreateFeature';
import PropTypes from 'prop-types';

const render = ({ history }) => (
    <CreateFeature title="Create feature toggle" history={history} />
);

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
