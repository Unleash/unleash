import { List } from 'immutable';
import { RECEIVE_FEATURE_TYPES } from './actions';

const DEFAULT_FEATURE_TYPES = [
    { id: 'release', name: 'Release', initial: true },
];

function getInitState() {
    return new List(DEFAULT_FEATURE_TYPES);
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_FEATURE_TYPES:
            return new List(action.value);
        default:
            return state;
    }
};

export default strategies;
