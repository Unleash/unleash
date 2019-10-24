import { RECEIVE_CONTEXT } from './actions';

const DEFAULT_CONTEXT_FIELDS = [{ name: 'environment' }, { name: 'userId' }, { name: 'appName' }];

function getInitState() {
    return DEFAULT_CONTEXT_FIELDS;
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_CONTEXT:
            return action.value;
        default:
            return state;
    }
};

export default strategies;
