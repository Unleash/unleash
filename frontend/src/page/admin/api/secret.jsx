import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@material-ui/core';

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

            <a href="" onClick={toggle} title="Show token">
                <Icon style={{ marginLeft: '5px', fontSize: '1.2em' }}>visibility</Icon>
            </a>
        </div>
    );
}

Secret.propTypes = {
    value: PropTypes.string,
};

export default Secret;
