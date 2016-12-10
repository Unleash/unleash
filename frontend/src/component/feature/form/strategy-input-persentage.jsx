import React from 'react';
import { Slider }  from 'react-mdl';

const labelStyle = {
    margin: '0',
    color: '#3f51b5',
    fontSize: '12px',
};

export default ({ field, value, onChange }) => (
    <div>
        <label style={labelStyle}>{field}: {value}%</label>
        <Slider min={0} max={100} defaultValue={value} value={value} onChange={onChange} label={field} />
    </div>
);
