import React, { PropTypes } from 'react';
import HistoryListToggle from '../../component/history/history-list-toggle-container';

const render = ({ params }) => (
    <HistoryListToggle toggleName={params.toggleName} />
);

render.propTypes = {
    params: PropTypes.object.isRequired,
};

export default render;
