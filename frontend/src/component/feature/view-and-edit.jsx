import React, { PropTypes } from 'react';

import FormComponent from './form';


const Render = (props) => {
    return (
        <div>
            <h1>{props.featureToggle.name}</h1>

            <p>add metrics</p>
            <p>add apps</p>
            <p>add instances</p>

            <hr />
            <h5>Edit</h5>
            <FormComponent {...props} />
        </div>
    );
};

export default Render;
