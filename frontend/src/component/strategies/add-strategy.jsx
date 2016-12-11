import React, { PropTypes } from 'react';

import { Textfield, IconButton, Menu, MenuItem } from 'react-mdl';
import { HeaderTitle, FormButtons } from '../common';


const trim = (value) => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

function gerArrayWithEntries (num) {
    return Array.from(Array(num));
}
export const PARAM_PREFIX = 'param_';
export const TYPE_PREFIX = 'type_';

const genParams = (input, num = 0, setValue) => (<div>{gerArrayWithEntries(num).map((v, i) => {
    const key = `${PARAM_PREFIX}${i + 1}`;
    const typeKey = `${TYPE_PREFIX}${i + 1}`;
    return (
        <div key={key}>
            <Textfield
                style={{ width: '50%' }}
                floatingLabel
                label={`Parameter name ${i + 1}`}
                name={key}
                onChange={({ target }) => setValue(key, target.value)}
                value={input[key]} />
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span id={`${key}-type-menu`}>
                        {input[typeKey] || 'string'}
                        <IconButton name="arrow_drop_down" onClick={(evt) => evt.preventDefault()} />
                    </span>
                    <Menu target={`${key}-type-menu`} align="right">
                        <MenuItem onClick={() => setValue(typeKey, 'string')}>String</MenuItem>
                        <MenuItem onClick={() => setValue(typeKey, 'percentage')}>Percentage</MenuItem>
                        <MenuItem onClick={() => setValue(typeKey, 'list')}>List of values</MenuItem>
                        <MenuItem onClick={() => setValue(typeKey, 'number')}>Number</MenuItem>
                    </Menu>
                </div>
        </div>
    );
})}</div>);

const AddStrategy = ({
    input,
    setValue,
    incValue,
    // clear,
    onCancel,
    onSubmit,
}) => (
    <form onSubmit={onSubmit(input)}>
        <HeaderTitle title="Create new strategy" subtitle="It is not possible to edit a strategy after it is created."/>
        <section style={{ margin: '16px 20px' }}>
            <Textfield label="Strategy name"
                floatingLabel
                name="name"
                required
                pattern="^[0-9a-zA-Z\.\-]+$"
                onChange={({ target }) => setValue('name', trim(target.value))}
                value={input.name}
                />
            <br />
            <Textfield
                floatingLabel
                style={{ width: '100%' }}
                rows={2}
                label="Description"
                name="description"
                onChange={({ target }) => setValue('description', target.value)}
                value={input.description}
                />
        </section>

        <section style={{ margin: '0 20px' }}>
            {genParams(input, input._params, setValue)}
            <IconButton raised name="add" title="Add parameter" onClick={(e) => {
                e.preventDefault();
                incValue('_params');
            }}/> &nbsp;Add parameter
        </section>

        <br />
        <hr />

        <FormButtons
            onCancel={onCancel}
        />
    </form>
);

AddStrategy.propTypes = {
    input: PropTypes.object,
    setValue: PropTypes.func,
    incValue: PropTypes.func,
    clear: PropTypes.func,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default AddStrategy;
