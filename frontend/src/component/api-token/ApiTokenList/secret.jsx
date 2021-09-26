import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
function Secret({ value }) {
    const [show, setShow] = useState(false);
    const toggle = evt => {
        evt.preventDefault();
        setShow(!show);
    };

    return (
        <div>
            {show ? (
                <input readOnly value={value} style={{ width: '250px' }} />
            ) : (
                <span style={{ width: '250px', display: 'inline-block' }}>************************************</span>
            )}

            <IconButton
                aria-label="Show token"
                onClick={toggle}
                title="Show token"
            >
                <Visibility style={{ marginLeft: '5px', fontSize: '1.2em' }} />
            </IconButton>
        </div>
    );
}

Secret.propTypes = {
    value: PropTypes.string,
};

export default Secret;
