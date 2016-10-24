import { Map as $Map } from 'immutable';
import actions from './input-actions';

function getInitState () {
    return new $Map();
}

function assertId (state, id) {
    if (!state.has(id)) {
        return state.set(id, new $Map({ inputId: id }));
    }
    return state;
}

function setKeyValue (state, { id, key, value }) {
    state = assertId(state, id);
    return state.setIn([id, key], value);
}

function increment (state, { id, key }) {
    state = assertId(state, id);
    return state.updateIn([id, key], (value = 0)  => value + 1);
}

function clear (state, { id }) {
    if (state.has(id)) {
        return state.remove(id);
    }
    return state;
}

const inputState = (state = getInitState(), action) => {

    if (!action.id) {
        return state;
    }

    switch (action.type) {
        case actions.SET_VALUE:
            if (actions.key != null && actions.value != null) {
                throw new Error('Missing required key / value');
            }
            return setKeyValue(state, action);
        case actions.INCREMENT_VALUE:
            return increment(state, action);
        case actions.CLEAR:
            return clear(state, action);
        default:
            // console.log('TYPE', action.type, action);
            return state;
    }
};

export default inputState;
