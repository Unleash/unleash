import api from './api';
import { dispatchAndThrow } from '../util';

export const RECEIVE_FEATURE_TYPES = 'RECEIVE_FEATURE_TYPES';
export const ERROR_RECEIVE_FEATURE_TYPES = 'ERROR_RECEIVE_FEATURE_TYPES';

const receiveFeatureTypes = value => ({ type: RECEIVE_FEATURE_TYPES, value });

export function fetchFeatureTypes() {
    return dispatch =>
        api
            .fetchAll()
            .then(json => dispatch(receiveFeatureTypes(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_FEATURE_TYPES));
}
