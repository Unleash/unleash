import React from 'react';
import { Slider }  from 'react-mdl';

const labelStyle = {
    margin: '20px 0',
    textAlign: 'center',
    color: '#3f51b5',
    fontSize: '12px',
};

export default ({ name, value, onChange }) => (
    <div>
        <div style={labelStyle}>{name}: {value}%</div>
        <Slider min={0} max={100} defaultValue={value} value={value} onChange={onChange} label={name} />
    </div>
);
