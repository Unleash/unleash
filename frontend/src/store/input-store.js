import { Map as $Map, List, fromJS } from 'immutable';
import actions from './input-actions';
import { USER_LOGOUT, USER_LOGIN } from './user/actions';

function getInitState() {
    return new $Map();
}

function init(state, { id, value }) {
    state = assertId(state, id);
    return state.setIn(id, fromJS(value));
}

function assertId(state, id) {
    if (!state.hasIn(id)) {
        return state.setIn(id, new $Map({ inputId: id }));
    }
    return state;
}

function assertList(state, id, key) {
    if (!state.getIn(id).has(key) || state.getIn(id).get(key) == null) {
        return state.setIn(id.concat([key]), new List());
    }
    return state;
}

function setKeyValue(state, { id, key, value }) {
    state = assertId(state, id);
    return state.setIn(id.concat([key]), value);
}

function increment(state, { id, key }) {
    state = assertId(state, id);
    return state.updateIn(id.concat([key]), (value = 0) => value + 1);
}

function clear(state, { id }) {
    if (state.hasIn(id)) {
        return state.removeIn(id);
    }
    return state;
}

function addToList(state, { id, key, value }) {
    state = assertId(state, id);
    state = assertList(state, id, key);

    return state.updateIn(id.concat([key]), list => list.push(value));
}

function updateInList(state, { id, key, index, newValue, merge }) {
    state = assertId(state, id);
    state = assertList(state, id, key);

    return state.updateIn(id.concat([key]), list => {
        if (merge && list.has(index)) {
            newValue = list.get(index).merge(new $Map(newValue));
        } else if (typeof newValue !== 'string') {
            newValue = fromJS(newValue);
        }
        return list.set(index, newValue);
    });
}

function removeFromList(state, { id, key, index }) {
    state = assertId(state, id);
    state = assertList(state, id, key);

    return state.updateIn(id.concat([key]), list => list.remove(index));
}

function move(state, { id, key, index, toIndex }) {
    return state.updateIn(id.concat([key]), list => {
        const olditem = list.get(index);
        return list.delete(index).insert(toIndex, olditem);
    });
}

const inputState = (state = getInitState(), action) => {
    if (!action.id) {
        return state;
    }

    switch (action.type) {
        case actions.INIT:
            return init(state, action);
        case actions.SET_VALUE:
            if (actions.key != null && actions.value != null) {
                throw new Error('Missing required key / value');
            }
            return setKeyValue(state, action);
        case actions.INCREMENT_VALUE:
            return increment(state, action);
        case actions.LIST_PUSH:
            return addToList(state, action);
        case actions.LIST_POP:
            return removeFromList(state, action);
        case actions.MOVE:
            return move(state, action);
        case actions.LIST_UP:
            return updateInList(state, action);
        case actions.CLEAR:
            return clear(state, action);
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            // console.log('TYPE', action.type, action);
            return state;
    }
};

export default inputState;
