import React from 'react';
import ApplicationEditComponent from '../../component/application/application-edit-container';

const render = ({ params }) => <ApplicationEditComponent appName={params.name} />;

export default render;
