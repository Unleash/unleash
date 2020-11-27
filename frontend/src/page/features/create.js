import React from 'react';
import AddFeatureToggleForm from '../../component/feature/create/add-feature-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <AddFeatureToggleForm title="Create feature toggle" history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
