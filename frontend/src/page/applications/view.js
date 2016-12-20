import React, { PropTypes } from 'react';
import ApplicationEditComponent from '../../component/application/application-edit-container';

const render = ({ params }) => <ApplicationEditComponent appName={params.name} />;

render.propTypes = {
    params: PropTypes.object.isRequired,
};

export default render;
