import {
    ADD_FEATURE_TOGGLE,
    RECEIVE_FEATURE_TOGGLES,
    UPDATE_FEATURE_TOGGLE,
} from './feature-actions';

const feature = (state = {}, action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            return action.featureToggle;
        case UPDATE_FEATURE_TOGGLE:
            if (state.name !== action.featureToggle.name) {
                return state;
            }
            return action.featureToggle;
        default:
            return state;
    }
};

const features = (state = [], action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            return [
                ...state,
                feature(undefined, action),
            ];
        case UPDATE_FEATURE_TOGGLE:
            return state.map(t =>
            feature(t, action)
        );
        case RECEIVE_FEATURE_TOGGLES: {
            return action.featureToggles;
        }
        default:
            return state;
    }
};

export default features;
