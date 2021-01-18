import React from 'react';
import PropTypes from 'prop-types';

const Select = ({ name, value, label, options, style, onChange, disabled = false, filled }) => {
    const wrapper = Object.assign({ width: 'auto' }, style);
    return (
        <div
            className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty is-upgraded"
            style={wrapper}
        >
            <select
                className="mdl-textfield__input"
                name={name}
                disabled={disabled}
                onChange={onChange}
                value={value}
                style={{ width: 'auto', background: filled ? '#f5f5f5' : 'none' }}
            >
                {options.map(o => (
                    <option key={o.key} value={o.key} title={o.title}>
                        {o.label}
                    </option>
                ))}
            </select>
            <label className="mdl-textfield__label" htmlFor="textfield-contextName">
                {label}
            </label>
        </div>
    );
};

Select.propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    filled: PropTypes.bool,
};

export default Select;
