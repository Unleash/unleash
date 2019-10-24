import api from '../../data/context-api';
import { dispatchAndThrow } from '../util';

export const RECEIVE_CONTEXT = 'RECEIVE_CONTEXT';
export const ERROR_RECEIVE_CONTEXT = 'ERROR_RECEIVE_CONTEXT';

export const receiveContext = json => ({
    type: RECEIVE_CONTEXT,
    value: json,
});

export function fetchContext() {
    return dispatch =>
        api
            .fetchContext()
            .then(json => dispatch(receiveContext(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_CONTEXT));
}
