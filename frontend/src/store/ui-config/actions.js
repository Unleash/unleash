import api from './api';
import { dispatchError } from '../util';

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
            .catch(dispatchError(dispatch, ERROR_RECEIVE_CONFIG));
}
