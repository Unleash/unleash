import { fromJS } from 'immutable';
import { RECEIVE_METRICS } from './metrics-actions';

function getInitState () {
    return fromJS({
        totalCount: 0,
        apps: [],
        clients: {},
    });
}

const historyStore = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_METRICS:
            return fromJS(action.value);
        default:
            return state;
    }
};

export default historyStore;
