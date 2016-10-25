import {
    createInc,
    createClear,
    createSet,
    createPop,
    createPush,
    createUp,
    createInit,
} from '../store/input-actions';

function getId (id, ownProps) {
    if (typeof id === 'function') {
        return id(ownProps); // should return array...
    }
    return [id];
}

export function createMapper ({ id, getDefault, prepare = (v) => v }) {
    return (state, ownProps) => {
        let input;
        let initCallRequired = false;
        const scope = getId(id, ownProps);
        if (state.input.hasIn(scope)) {
            input = state.input.getIn(scope).toJS();
        } else {
            initCallRequired = true;
            input = getDefault ? getDefault(state, ownProps) : {};
        }

        return prepare({
            initCallRequired,
            input,
        }, state, ownProps);
    };
}

export function createActions ({ id, prepare = (v) => v }) {
    return (dispatch, ownProps) => (prepare({

        clear () {
            dispatch(createClear({ id: getId(id, ownProps) }));
        },

        init (value) {
            dispatch(createInit({ id: getId(id, ownProps), value }));
        },

        setValue (key, value) {
            dispatch(createSet({ id: getId(id, ownProps), key, value }));
        },

        pushToList (key, value) {
            dispatch(createPush({ id: getId(id, ownProps), key, value }));
        },

        removeFromList (key, value) {
            dispatch(createPop({ id: getId(id, ownProps), key, value }));
        },

        updateInList (key, value, newValue) {
            dispatch(createUp({ id: getId(id, ownProps), key, value, newValue }));
        },

        incValue (key) {
            dispatch(createInc({ id: getId(id, ownProps), key }));
        },
    }, dispatch, ownProps));
}
