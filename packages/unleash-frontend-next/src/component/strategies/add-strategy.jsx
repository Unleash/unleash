import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import Input from 'react-toolbox/lib/input';
import Button from 'react-toolbox/lib/button';

import { createMapper, createActions } from '../input-helpers';
import { createStrategy } from '../../store/strategy-actions';

function gerArrayWithEntries (num) {
    return Array.from(Array(num));
}
const PARAM_PREFIX = 'param_';
const genParams = (input, num = 0, setValue) => {
    return (<div>{gerArrayWithEntries(num).map((v, i) => {
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
};

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

const ID = 'add-strategy';

const actions = createActions(ID, (methods, dispatch) => {
    methods.onSubmit = (input) => (
        (e) => {
            e.preventDefault();

            const parametersTemplate = {};
            Object.keys(input).forEach(key => {
                if (key.startsWith(PARAM_PREFIX)) {
                    parametersTemplate[input[key]] = 'string';
                }
            });
            input.parametersTemplate = parametersTemplate;

            createStrategy(input)(dispatch)
                .then(() => methods.clear())
                // somewhat quickfix / hacky to go back..
                .then(() => window.history.back());
        }
    );

    methods.onCancel = (e) => {
        e.preventDefault();
        // somewhat quickfix / hacky to go back..
        window.history.back();
    };


    return methods;
});

export default connect(createMapper(ID), actions)(AddStrategy);
