import React from 'react';
import Strategies from '../../component/strategies/StrategiesList';
import PropTypes from 'prop-types';

const render = ({ history }) => <Strategies history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
