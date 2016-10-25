import React, { PropTypes } from 'react';

import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';

function gerArrayWithEntries (num) {
    return Array.from(Array(num));
}
export const PARAM_PREFIX = 'param_';

const genParams = (input, num = 0, setValue) => (<div>{gerArrayWithEntries(num).map((v, i) => {
    const key = `${PARAM_PREFIX}${i + 1}`;
    return (
        <Input
            type="text"
            label={`Parameter name ${i + 1}`}
            name={key} key={key}
            onChange={(value) => setValue(key, value)}
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
        <section>
            <Input type="text" label="Strategy name"
                name="name" required
                pattern="^[0-9a-zA-Z\.\-]+$"
                onChange={(value) => setValue('name', value)}
                value={input.name}
                />
            <Input type="text" multiline label="Description"
                name="description"
                onChange={(value) => setValue('description', value)}
                value={input.description}
                />
        </section>

        <section>
            {genParams(input, input._params, setValue)}
            <Button icon="add" accent label="Add parameter" onClick={(e) => {
                e.preventDefault();
                incValue('_params');
            }}/>
        </section>

        <br />
        <hr />

        <section>
            <Button type="submit" raised primary label="Create" />
            &nbsp;
            <Button type="cancel" raised label="Cancel" onClick={onCancel} />
        </section>
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
