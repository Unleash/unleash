import api from './api';
import { dispatchError } from '../util';
import { receiveProjects } from '../project/actions';
import { receiveStrategies } from '../strategy/actions';

export const RECEIVE_BOOTSTRAP = 'RECEIVE_CONFIG';
export const ERROR_RECEIVE_BOOTSTRAP = 'ERROR_RECEIVE_CONFIG';

export function fetchUiBootstrap() {
    return dispatch =>
        api
            .fetchUIBootstrap()
            .then(json => {
                dispatch(receiveProjects(json.projects));
                dispatch(receiveStrategies(json.strategies));
            })
            .catch(dispatchError(dispatch, ERROR_RECEIVE_BOOTSTRAP));
}
