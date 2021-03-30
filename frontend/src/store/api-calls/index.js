import {
    START_FETCH_FEATURE_TOGGLES,
    FETCH_FEATURE_TOGGLES_SUCCESS,
    FETCH_FEATURE_TOGGLE_ERROR,
} from '../feature-toggle/actions';

const apiCalls = (
    state = {
        fetchTogglesState: {
            loading: false,
            success: false,
            error: null,
            count: 0,
        },
    },
    action
) => {
    switch (action.type) {
        case START_FETCH_FEATURE_TOGGLES:
            if (state.fetchTogglesState.count > 0) return state;
            return {
                ...state,
                fetchTogglesState: {
                    loading: true,
                    success: false,
                    error: null,
                    count: (state.fetchTogglesState.count += 1),
                },
            };
        case FETCH_FEATURE_TOGGLES_SUCCESS:
            return {
                ...state,
                fetchTogglesState: {
                    ...state.fetchTogglesState,
                    loading: false,
                    success: true,
                    error: null,
                },
            };
        case FETCH_FEATURE_TOGGLE_ERROR:
            return {
                ...state,
                fetchTogglesState: {
                    ...state.fetchTogglesState,
                    loading: false,
                    success: false,
                    error: true,
                },
            };
        default:
            return state;
    }
};

export default apiCalls;
