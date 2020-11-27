import React from 'react';
import CopyFeatureToggleForm from '../../component/feature/create/copy-feature-container';
import PropTypes from 'prop-types';

const render = ({ history, match: { params } }) => (
    <CopyFeatureToggleForm title="Copy feature toggle" history={history} copyToggleName={params.copyToggle} />
);

render.propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
};

export default render;
