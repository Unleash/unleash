import React from 'react';
import PropTypes from 'prop-types';

const Select = ({ name, value, label, options, style, onChange }) => {
    const wrapper = Object.assign({ width: 'auto' }, style);
    return (
        <div
            className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-dirty is-upgraded"
            style={wrapper}
        >
            <select
                className="mdl-textfield__input"
                name={name}
                onChange={onChange}
                value={value}
                style={{ width: 'auto' }}
            >
                {options.map(o => (
                    <option key={o.key} value={o.key}>
                        {o.label}
                    </option>
                ))}
            </select>
            <label className="mdl-textfield__label" htmlFor="textfield-conextName">
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
};

export default Select;
