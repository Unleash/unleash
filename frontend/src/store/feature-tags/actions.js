import api from './api';
import { dispatchError } from '../util';

export const TAG_FEATURE_TOGGLE = 'TAG_FEATURE_TOGGLE';
export const UNTAG_FEATURE_TOGGLE = 'UNTAG_FEATURE_TOGGLE';
export const START_TAG_FEATURE_TOGGLE = 'START_TAG_FEATURE_TOGGLE';
export const START_UNTAG_FEATURE_TOGGLE = 'START_UNTAG_FEATURE_TOGGLE';
export const ERROR_TAG_FEATURE_TOGGLE = 'ERROR_TAG_FEATURE_TOGGLE';
export const ERROR_UNTAG_FEATURE_TOGGLE = 'ERROR_UNTAG_FEATURE_TOGGLE';
export const START_FETCH_FEATURE_TOGGLE_TAGS = 'START_FETCH_FEATURE_TOGGLE_TAGS';
export const RECEIVE_FEATURE_TOGGLE_TAGS = 'RECEIVE_FEATURE_TOGGLE_TAGS';
export const ERROR_FETCH_FEATURE_TOGGLE_TAGS = 'ERROR_FETCH_FEATURE_TOGGLE_TAGS';

function receiveFeatureToggleTags(json) {
    return {
        type: RECEIVE_FEATURE_TOGGLE_TAGS,
        value: json,
        receivedAt: Date.now(),
    };
}

export function tagFeature(featureToggle, tag) {
    return dispatch => {
        dispatch({ type: START_TAG_FEATURE_TOGGLE });
        return api
            .tagFeature(featureToggle, tag)
            .then(json => dispatch({ type: TAG_FEATURE_TOGGLE, featureToggle, tag: json }))
            .catch(dispatchError(dispatch, ERROR_TAG_FEATURE_TOGGLE));
    };
}

export function untagFeature(featureToggle, tag) {
    return dispatch => {
        dispatch({ type: START_UNTAG_FEATURE_TOGGLE });
        return api
            .untagFeature(featureToggle, tag)
            .then(() => dispatch({ type: UNTAG_FEATURE_TOGGLE, featureToggle, tag }))
            .catch(dispatchError(dispatch, ERROR_UNTAG_FEATURE_TOGGLE));
    };
}

export function fetchTags(featureToggle) {
    return dispatch => {
        dispatch({ type: START_FETCH_FEATURE_TOGGLE_TAGS });
        return api
            .fetchFeatureToggleTags(featureToggle)
            .then(json => dispatch(receiveFeatureToggleTags(json)))
            .catch(dispatchError(dispatch, ERROR_FETCH_FEATURE_TOGGLE_TAGS));
    };
}
