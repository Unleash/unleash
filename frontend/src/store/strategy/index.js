import { List, Map as $Map } from 'immutable';
import { RECEIVE_STRATEGIES, REMOVE_STRATEGY, ADD_STRATEGY } from './actions';

function getInitState () {
    return new $Map({ list: new List() });
}

function removeStrategy (state, action) {
    const indexToRemove = state.get('list').indexOf(action.strategy);
    if (indexToRemove !== -1) {
        return state.update('list', (list) => list.remove(indexToRemove));
    }
    return state;
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_STRATEGIES:
            return state.set('list', new List(action.value));
        case REMOVE_STRATEGY:
            return removeStrategy(state, action);
        case ADD_STRATEGY:
            return state.update('list', (list) => list.push(action.strategy));
        default:
            return state;
    }
};

export default strategies;
