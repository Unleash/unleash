const feature = (state = {}, action) => {
    switch (action.type) {
        case 'ADD_FEATURE_TOGGLE':
            return {
                id: action.id,
                featureName: action.featureName,
                enabled: false,
            };
        case 'TOGGLE_FEATURE_TOGGLE':
            if (state.id !== action.id) {
                return state;
            }

            return Object.assign({}, state, {
                enabled: !state.enabled,
            });

        default:
            return state;
    }
};

const features = (state = [{ id: 1, featureName: 'test', enabled: true }], action) => {
    switch (action.type) {
        case 'ADD_FEATURE_TOGGLE':
            return [
                ...state,
                feature(undefined, action),
            ];
        case 'TOGGLE_FEATURE_TOGGLE':
            return state.map(t =>
            feature(t, action)
        );
        default:
            return state;
    }
};

export default features;
