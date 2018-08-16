import React from 'react';
import AddStrategies from '../../component/strategies/add-container';
import PropTypes from 'prop-types';

const render = ({ history }) => <AddStrategies history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
