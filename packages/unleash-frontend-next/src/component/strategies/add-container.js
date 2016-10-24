import { connect } from 'react-redux';

import { createMapper, createActions } from '../input-helpers';
import { createStrategy } from '../../store/strategy-actions';

import AddStrategy, { PARAM_PREFIX } from './add-strategy';

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
