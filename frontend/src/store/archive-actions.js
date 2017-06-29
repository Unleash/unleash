import api from '../data/archive-api';

export const REVIVE_TOGGLE = 'REVIVE_TOGGLE';
export const RECEIVE_ARCHIVE = 'RECEIVE_ARCHIVE';
export const ERROR_RECEIVE_ARCHIVE = 'ERROR_RECEIVE_ARCHIVE';

const receiveArchive = (json) => ({
    type: RECEIVE_ARCHIVE,
    value: json.features,
});

const reviveToggle = (archiveFeatureToggle) => ({
    type: REVIVE_TOGGLE,
    value: archiveFeatureToggle,
});

const errorReceiveArchive = (statusCode) => ({
    type: ERROR_RECEIVE_ARCHIVE,
    statusCode,
});

export function revive (featureToggle) {
    return dispatch => api.revive(featureToggle)
        .then(() => dispatch(reviveToggle(featureToggle)))
        .catch(error => dispatch(errorReceiveArchive(error)));
}


export function fetchArchive () {
    return dispatch => api.fetchAll()
        .then(json => dispatch(receiveArchive(json)))
        .catch(error => dispatch(errorReceiveArchive(error)));
}
