import Immutable from 'immutable';

import {
    ADD_FEATURE_TOGGLE,
    RECEIVE_FEATURE_TOGGLES,
    UPDATE_FEATURE_TOGGLE,
} from './feature-actions';

const features = (state = [], action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            return [
                ...state,
                action.featureToggle,
            ];
        case UPDATE_FEATURE_TOGGLE:
            return state.map(t => {
                if (t.name !== action.featureToggle.name) {
                    return t;
                }
                return action.featureToggle;
            });
        case RECEIVE_FEATURE_TOGGLES: {
            return action.featureToggles;
        }
        default:
            return state;
    }
};

export default features;
