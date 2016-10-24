import { createInc, createClear, createSet } from '../store/input-actions';

export function createMapper (id, prepare = (v) => v) {
    return (state) => {
        let input;
        if (state.input.has(id)) {
            input = state.input.get(id).toJS();
        } else {
            input = {};
        }

        return prepare({
            input,
        }, state);
    };
}

export function createActions (id, prepare = (v) => v) {
    return (dispatch) => (prepare({
        clear () {
            dispatch(createClear({ id }));
        },

        setValue (key, value) {
            dispatch(createSet({ id, key, value }));
        },

        incValue (key) {
            dispatch(createInc({ id, key }));
        },
    }, dispatch));
}
