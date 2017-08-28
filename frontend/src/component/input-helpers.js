import {
    createInc,
    createClear,
    createSet,
    createPop,
    createPush,
    createUp,
    createInit,
    createMove,
} from '../store/input-actions';

function getId(id, ownProps) {
    if (typeof id === 'function') {
        return id(ownProps); // should return array...
    }
    return [id];
}

export function createMapper({ id, getDefault, prepare = v => v }) {
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

        return prepare(
            {
                initCallRequired,
                input,
            },
            state,
            ownProps
        );
    };
}

export function createActions({ id, prepare = v => v }) {
    return (dispatch, ownProps) =>
        prepare(
            {
                clear() {
                    dispatch(createClear({ id: getId(id, ownProps) }));
                },

                init(value) {
                    dispatch(createInit({ id: getId(id, ownProps), value }));
                },

                setValue(key, value) {
                    dispatch(createSet({ id: getId(id, ownProps), key, value }));
                },

                pushToList(key, value) {
                    dispatch(createPush({ id: getId(id, ownProps), key, value }));
                },

                removeFromList(key, index) {
                    dispatch(createPop({ id: getId(id, ownProps), key, index }));
                },

                moveItem(key, index, toIndex) {
                    dispatch(createMove({ id: getId(id, ownProps), key, index, toIndex }));
                },

                updateInList(key, index, newValue, merge = false) {
                    dispatch(createUp({ id: getId(id, ownProps), key, index, newValue, merge }));
                },

                incValue(key) {
                    dispatch(createInc({ id: getId(id, ownProps), key }));
                },
            },
            dispatch,
            ownProps
        );
}
