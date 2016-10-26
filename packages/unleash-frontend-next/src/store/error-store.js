import { List, Map as $Map } from 'immutable';
import { ERROR_RECEIVE_FEATURE_TOGGLES } from './feature-actions';
import { MUTE_ERRORS } from './error-actions';
const debug = require('debug')('unleash:error-store');

function getInitState () {
    return new $Map({
        list: new List(),
        showError: false,
    });
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case ERROR_RECEIVE_FEATURE_TOGGLES:
            debug('Got error', action);
            return state
                .update('list', (list) => list.push('Failed fetching feature toggles'))
                .set('showError', true);
        case MUTE_ERRORS:
            debug('muting errors');
            return state.set('showError', false);
        default:
            return state;
    }
};

export default strategies;
