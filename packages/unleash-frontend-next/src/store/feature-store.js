import { List, Map } from 'immutable';


import {
    ADD_FEATURE_TOGGLE,
    RECEIVE_FEATURE_TOGGLES,
    UPDATE_FEATURE_TOGGLE,
} from './feature-actions';


const features = (state = new List([]), action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            return state.push(new Map(action.featureToggle));
        case UPDATE_FEATURE_TOGGLE:
            return state.map(t => {
                if (t.get('name') === action.featureToggle.name) {
                    return new Map(action.featureToggle);
                } else {
                    return t;
                }
            });
        case RECEIVE_FEATURE_TOGGLES:
            return new List(action.featureToggles.map(t => new Map(t)));
        default:
            return state;
    }
};

export default features;
