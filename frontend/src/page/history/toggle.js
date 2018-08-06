import React from 'react';
import PropTypes from 'prop-types';
import HistoryListToggle from '../../component/history/history-list-toggle-container';

const render = ({ match: { params } }) => <HistoryListToggle toggleName={params.toggleName} />;

render.propTypes = {
    match: PropTypes.object.isRequired,
};

export default render;
