import { List, Map as $Map } from 'immutable';
import {
    ADD_FEATURE_TOGGLE,
    RECEIVE_FEATURE_TOGGLES,
    RECEIVE_FEATURE_TOGGLE,
    UPDATE_FEATURE_TOGGLE,
    UPDATE_FEATURE_TOGGLE_STRATEGIES,
    REMOVE_FEATURE_TOGGLE,
    TOGGLE_FEATURE_TOGGLE,
} from './actions';

import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

const debug = require('debug')('unleash:feature-store');

const features = (state = new List([]), action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            debug(ADD_FEATURE_TOGGLE, action);
            return state.push(new $Map(action.featureToggle));
        case REMOVE_FEATURE_TOGGLE:
            debug(REMOVE_FEATURE_TOGGLE, action);
            return state.filter(
                toggle => toggle.get('name') !== action.featureToggleName
            );
        case TOGGLE_FEATURE_TOGGLE:
            debug(TOGGLE_FEATURE_TOGGLE, action);
            return state.map(toggle => {
                if (toggle.get('name') === action.name) {
                    return toggle.set('enabled', !toggle.get('enabled'));
                } else {
                    return toggle;
                }
            });
        case UPDATE_FEATURE_TOGGLE_STRATEGIES:
            debug(UPDATE_FEATURE_TOGGLE_STRATEGIES, action);
            return state.map(toggle => {
                if (toggle.get('name') === action.featureToggle.name) {
                    return new $Map(action.featureToggle);
                } else {
                    return toggle;
                }
            });
        case UPDATE_FEATURE_TOGGLE:
            debug(UPDATE_FEATURE_TOGGLE, action);
            return state.map(toggle => {
                if (toggle.get('name') === action.featureToggle.name) {
                    return new $Map(action.featureToggle);
                } else {
                    return toggle;
                }
            });
        case RECEIVE_FEATURE_TOGGLE:
            debug(RECEIVE_FEATURE_TOGGLE, action);
            return state.map(toggle => {
                if (toggle.get('name') === action.featureToggle.name) {
                    return new $Map(action.featureToggle);
                } else {
                    return toggle;
                }
            });
        case RECEIVE_FEATURE_TOGGLES:
            debug(RECEIVE_FEATURE_TOGGLES, action);
            return new List(action.featureToggles.map($Map));
        case USER_LOGIN:
        case USER_LOGOUT:
            debug(USER_LOGOUT, action);
            return new List([]);
        default:
            return state;
    }
};

export default features;
