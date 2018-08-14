import React from 'react';
import FeatureListContainer from './../../component/feature/list-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <FeatureListContainer logout history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
