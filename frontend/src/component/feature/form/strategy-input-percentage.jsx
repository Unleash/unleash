import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from 'react-mdl';

const labelStyle = {
    margin: '20px 0',
    textAlign: 'center',
    color: '#3f51b5',
    fontSize: '12px',
};

const InputPercentage = ({ name, value, onChange }) => (
    <div style={{ marginBottom: '20px' }}>
        <div style={labelStyle}>
            {name}: {value}%
        </div>
        <Slider min={0} max={100} defaultValue={value} value={value} onChange={onChange} label={name} />
    </div>
);

InputPercentage.propTypes = {
    name: PropTypes.string,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

export default InputPercentage;
