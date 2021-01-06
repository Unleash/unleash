import api from './api';
import { dispatchAndThrow } from '../util';

export const REVIVE_TOGGLE = 'REVIVE_TOGGLE';
export const RECEIVE_ARCHIVE = 'RECEIVE_ARCHIVE';
export const ERROR_RECEIVE_ARCHIVE = 'ERROR_RECEIVE_ARCHIVE';

const receiveArchive = json => ({
    type: RECEIVE_ARCHIVE,
    value: json.features,
});

const reviveToggle = archiveFeatureToggle => ({
    type: REVIVE_TOGGLE,
    value: archiveFeatureToggle,
});

export function revive(featureToggle) {
    return dispatch =>
        api
            .revive(featureToggle)
            .then(() => dispatch(reviveToggle(featureToggle)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_ARCHIVE));
}

export function fetchArchive() {
    return dispatch =>
        api
            .fetchAll()
            .then(json => dispatch(receiveArchive(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_ARCHIVE));
}
