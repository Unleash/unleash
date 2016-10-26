import { List, Map as $Map } from 'immutable';
import { MUTE_ERRORS } from './error-actions';
import {
    ERROR_RECEIVE_FEATURE_TOGGLES,
    ERROR_CREATING_FEATURE_TOGGLE,
} from './feature-actions';

const debug = require('debug')('unleash:error-store');

function getInitState () {
    return new $Map({
        list: new List(),
        showError: false,
    });
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case ERROR_CREATING_FEATURE_TOGGLE:
        case ERROR_RECEIVE_FEATURE_TOGGLES:
            debug('Got error', action);
            return state
                .update('list', (list) => list.push(action.errorMsg))
                .set('showError', true);
        case MUTE_ERRORS:
            debug('muting errors');
            return state.set('showError', false);
        default:
            return state;
    }
};

export default strategies;
