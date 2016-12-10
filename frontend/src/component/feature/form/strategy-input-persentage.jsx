import React from 'react';
import { Slider }  from 'react-mdl';

const labelStyle = {
    margin: '10px',
    textAlign: 'center',
    color: '#3f51b5',
    fontSize: '12px',
};

export default ({ field, value, onChange }) => (
    <div>
        <div style={labelStyle}>{field}: {value}%</div>
        <Slider min={0} max={100} defaultValue={value} value={value} onChange={onChange} label={field} />
    </div>
);
