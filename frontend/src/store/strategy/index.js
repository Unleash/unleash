import { List, Map as $Map } from 'immutable';
import {
    RECEIVE_STRATEGIES,
    REMOVE_STRATEGY,
    ADD_STRATEGY,
    UPDATE_STRATEGY,
    DEPRECATE_STRATEGY,
    REACTIVATE_STRATEGY,
} from './actions';

function getInitState() {
    return new $Map({ list: new List() });
}

function removeStrategy(state, action) {
    const indexToRemove = state.get('list').indexOf(action.strategy);
    if (indexToRemove !== -1) {
        return state.update('list', list => list.remove(indexToRemove));
    }
    return state;
}

function updateStrategy(state, action) {
    return state.update('list', list =>
        list.map(strategy => {
            if (strategy.name === action.strategy.name) {
                return action.strategy;
            } else {
                return strategy;
            }
        })
    );
}

function setDeprecationStatus(state, action, status) {
    return state.update('list', list =>
        list.map(strategy => {
            if (strategy.name === action.strategy.name) {
                action.strategy.deprecated = status;
                return action.strategy;
            } else {
                return strategy;
            }
        })
    );
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_STRATEGIES:
            return state.set('list', new List(action.value));
        case REMOVE_STRATEGY:
            return removeStrategy(state, action);
        case ADD_STRATEGY:
            return state.update('list', list => list.push(action.strategy));
        case UPDATE_STRATEGY:
            return updateStrategy(state, action);
        case DEPRECATE_STRATEGY:
            return setDeprecationStatus(state, action, true);
        case REACTIVATE_STRATEGY:
            return setDeprecationStatus(state, action, false);
        default:
            return state;
    }
};

export default strategies;
