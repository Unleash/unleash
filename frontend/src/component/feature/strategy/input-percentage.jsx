import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from 'react-mdl';

const labelStyle = {
    textAlign: 'center',
    color: 'rgb(96,125,139)',
    fontSize: '2em',
};

const infoLabelStyle = {
    fontSize: '0.8em',
    color: 'gray',
    paddingBottom: '-3px',
};

const InputPercentage = ({ name, minLabel, maxLabel, value, onChange, disabled = false }) => (
    <div style={{ margin: '20px 0' }}>
        <table style={{ width: '100%' }} colSpan="0" cellSpacing="0" cellPadding="0">
            <tbody>
                <tr>
                    <td style={{ textAlign: 'left', paddingLeft: '20px', width: '20px' }}>
                        <span style={infoLabelStyle}>{minLabel}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        <strong title={name} style={labelStyle}>
                            {value}%
                        </strong>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px', width: '20px' }}>
                        <span style={infoLabelStyle}>{maxLabel}</span>&nbsp;
                    </td>
                </tr>
                <tr>
                    <td colSpan="3">
                        <Slider min={0} max={100} value={value} onChange={onChange} label={name} disabled={disabled} />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

InputPercentage.propTypes = {
    name: PropTypes.string,
    minLabel: PropTypes.string,
    maxLabel: PropTypes.string,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default InputPercentage;
