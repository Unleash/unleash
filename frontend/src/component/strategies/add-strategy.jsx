import React, { PropTypes } from 'react';

import { Textfield, IconButton } from 'react-mdl';
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

const genParams = (input, num = 0, setValue) => (<div>{gerArrayWithEntries(num).map((v, i) => {
    const key = `${PARAM_PREFIX}${i + 1}`;
    return (
        <Textfield
            label={`Parameter name ${i + 1}`}
            name={key} key={key}
            onChange={({ target }) => setValue(key, target.value)}
            value={input[key]} />
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
        <HeaderTitle title="Create new strategy"/>
        <section>
            <Textfield label="Strategy name"
                name="name" required
                pattern="^[0-9a-zA-Z\.\-]+$"
                onChange={({ target }) => setValue('name', trim(target.value))}
                value={input.name}
                />
            <br />
            <Textfield
                rows={2}
                label="Description"
                name="description"
                onChange={({ target }) => setValue('description', target.value)}
                value={input.description}
                />
        </section>

        <section>
            {genParams(input, input._params, setValue)}
            <IconButton name="add" title="Add parameter" onClick={(e) => {
                e.preventDefault();
                incValue('_params');
            }}/>
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
