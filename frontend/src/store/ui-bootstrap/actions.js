import api from './api';
import { dispatchError } from '../util';

export const RECEIVE_BOOTSTRAP = 'RECEIVE_CONFIG';
export const ERROR_RECEIVE_BOOTSTRAP = 'ERROR_RECEIVE_CONFIG';

export function fetchUiBootstrap() {
    return dispatch =>
        api
            .fetchUIBootstrap()
            .then(json => {})
            .catch(dispatchError(dispatch, ERROR_RECEIVE_BOOTSTRAP));
}
