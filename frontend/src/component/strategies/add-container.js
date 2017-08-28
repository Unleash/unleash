import { connect } from 'react-redux';

import { createMapper, createActions } from '../input-helpers';
import { createStrategy } from '../../store/strategy/actions';

import AddStrategy from './add-strategy';

const ID = 'add-strategy';

const prepare = (methods, dispatch) => {
    methods.onSubmit = input => e => {
        e.preventDefault();
        // clean
        const parameters = (input.parameters || [])
            .filter(name => !!name)
            .map(
                ({
                    name,
                    type = 'string',
                    description = '',
                    required = false,
                }) => ({
                    name,
                    type,
                    description,
                    required,
                })
            );

        createStrategy({
            name: input.name,
            description: input.description,
            parameters,
        })(dispatch)
            .then(() => methods.clear())
            // somewhat quickfix / hacky to go back..
            .then(() => window.history.back());
    };

    methods.onCancel = e => {
        e.preventDefault();
        methods.clear();
        // somewhat quickfix / hacky to go back..
        window.history.back();
    };

    return methods;
};

const actions = createActions({
    id: ID,
    prepare,
});

export default connect(
    createMapper({
        id: ID,
        getDefault() {
            let name;
            try {
                [, name] = document.location.hash.match(/name=([a-z0-9-_.]+)/i);
            } catch (e) {}
            return { name };
        },
    }),
    actions
)(AddStrategy);
