import React, { PropTypes } from 'react';

import { Textfield, IconButton, Menu, MenuItem, Checkbox } from 'react-mdl';
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

const Parameter = ({ set, input = {}, index }) => (
    <div  style={{ background: '#f1f1f1', margin: '20px 0', padding: '10px' }}>
        <Textfield
            style={{ width: '50%' }}
            floatingLabel
            label={`Parameter name ${index + 1}`}
            onChange={({ target }) => set({ name: target.value }, true)}
            value={input.name} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <span id={`${index}-type-menu`}>
                {input.type || 'string'}
                <IconButton name="arrow_drop_down" onClick={(evt) => evt.preventDefault()} />
            </span>
            <Menu target={`${index}-type-menu`} align="right">
                <MenuItem onClick={() => set({ type: 'string' })}>String</MenuItem>
                <MenuItem onClick={() => set({ type: 'percentage' })}>Percentage</MenuItem>
                <MenuItem onClick={() => set({ type: 'list' })}>List of values</MenuItem>
                <MenuItem onClick={() => set({ type: 'number' })}>Number</MenuItem>
            </Menu>
        </div>
        <Textfield
            floatingLabel
            style={{ width: '100%' }}
            rows={2}
            label={`Parameter name ${index + 1} description`}
            onChange={({ target }) => set({ description: target.value })}
            value={input.description}
        />
        <Checkbox
            label="Required"
            checked={!!input.required}
            onChange={() => set({ required: !input.required })}
            ripple
            defaultChecked
        />
    </div>
);

const Parameters = ({ input = [], count = 0, updateInList }) => (
<div>{
    gerArrayWithEntries(count)
    .map((v, i) => <Parameter
        key={i}
        set={(v) => updateInList('parameters', i, v, true)}
        index={i}
        input={input[i]}
    />)
}</div>);

const AddStrategy = ({
    input,
    setValue,
    updateInList,
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
            <Parameters input={input.parameters} count={input._params} updateInList={updateInList} />
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
    updateInList: PropTypes.func,
    incValue: PropTypes.func,
    clear: PropTypes.func,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default AddStrategy;
