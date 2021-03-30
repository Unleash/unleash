import React from 'react';
import Addons from '../../component/addons';
import PropTypes from 'prop-types';

const render = ({ history }) => <Addons history={history} />;

render.propTypes = {
    history: PropTypes.object.isRequired,
};

export default render;
