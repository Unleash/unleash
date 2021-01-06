import api from './api';
import { dispatchAndThrow } from '../util';

export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export const ERROR_RECEIVE_CONFIG = 'ERROR_RECEIVE_CONFIG';

export const receiveConfig = json => ({
    type: RECEIVE_CONFIG,
    value: json,
});

export function fetchUIConfig() {
    return dispatch =>
        api
            .fetchConfig()
            .then(json => dispatch(receiveConfig(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_CONFIG));
}
