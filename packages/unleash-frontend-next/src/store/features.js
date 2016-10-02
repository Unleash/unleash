import {
    ADD_FEATURE_TOGGLE,
    TOGGLE_FEATURE_TOGGLE,
    RECEIVE_FEATURE_TOGGLES,
} from './featureToggleActions';

const feature = (state = {}, action) => {
    switch (action.type) {
        case ADD_FEATURE_TOGGLE:
            return action.featureToggle;
        case TOGGLE_FEATURE_TOGGLE:
            if (state.name !== action.name) {
                return state;
            }

            return Object.assign({}, state, {
                enabled: !state.enabled,
            });

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
        case TOGGLE_FEATURE_TOGGLE:
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
