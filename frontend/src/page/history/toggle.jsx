import React from 'react';
import PropTypes from 'prop-types';
import { FeatureEventHistory } from '../../component/history/FeatureEventHistory/FeatureEventHistory';

const render = ({ match: { params } }) => (
    <FeatureEventHistory toggleName={params.toggleName} />
);

render.propTypes = {
    match: PropTypes.object.isRequired,
};

export default render;
