import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon, IconButton } from '@material-ui/core';

function Secret({ value }) {
    const [show, setShow] = useState(false);
    const toggle = evt => {
        evt.preventDefault();
        setShow(!show);
    };

    return (
        <div>
            {show ? (
                <input readOnly value={value} style={{ width: '240px' }} />
            ) : (
                <span>***************************</span>
            )}

            <IconButton aria-label="Show token" onClick={toggle} title="Show token">
                <Icon style={{ marginLeft: '5px', fontSize: '1.2em' }}>visibility</Icon>
            </IconButton>
        </div>
    );
}

Secret.propTypes = {
    value: PropTypes.string,
};

export default Secret;
