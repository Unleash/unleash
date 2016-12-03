import { fromJS } from 'immutable';
import { RECEIVE_APPLICATINS } from './actions';

function getInitState () {
    return fromJS([]);
}

const store = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_APPLICATINS:
            return fromJS(action.value.applications);
        default:
            return state;
    }
};

export default store;
