import React from 'react';
import PropTypes from 'prop-types';
import { Slider, Grid, Cell } from 'react-mdl';

const labelStyle = {
    textAlign: 'center',
    color: '#3f51b5',
};

const infoLabelStyle = {
    fontSize: '0.8em',
    color: 'gray',
    paddingBottom: '-3px',
};

const InputPercentage = ({ name, minLabel, maxLabel, value, onChange }) => (
    <div style={{ marginBottom: '20px' }}>
        <Grid noSpacing style={{ margin: '0 15px' }}>
            <Cell col={1}>
                &nbsp;<span style={infoLabelStyle}>{minLabel}</span>
            </Cell>
            <Cell col={10} style={labelStyle}>
                {name}: {value}%
            </Cell>
            <Cell col={1} style={{ textAlign: 'right' }}>
                <span style={infoLabelStyle}>{maxLabel}</span>&nbsp;
            </Cell>
        </Grid>
        <Slider min={0} max={100} value={value} onChange={onChange} label={name} />
    </div>
);

InputPercentage.propTypes = {
    name: PropTypes.string,
    minLabel: PropTypes.string,
    maxLabel: PropTypes.string,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

export default InputPercentage;
