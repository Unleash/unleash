import api from './api';
import applicationApi from '../application/api';
import { dispatchError } from '../util';
import { MUTE_ERROR } from '../error/actions';

export const ADD_STRATEGY = 'ADD_STRATEGY';
export const UPDATE_STRATEGY = 'UPDATE_STRATEGY';
export const REMOVE_STRATEGY = 'REMOVE_STRATEGY';
export const DEPRECATE_STRATEGY = 'DEPRECATE_STRATEGY';
export const REACTIVATE_STRATEGY = 'REACTIVATE_STRATEGY';
export const REQUEST_STRATEGIES = 'REQUEST_STRATEGIES';
export const START_CREATE_STRATEGY = 'START_CREATE_STRATEGY';
export const START_UPDATE_STRATEGY = 'START_UPDATE_STRATEGY';
export const START_DEPRECATE_STRATEGY = 'START_DEPRECATE_STRATEGY';
export const START_REACTIVATE_STRATEGY = 'START_REACTIVATE_STRATEGY';
export const RECEIVE_STRATEGIES = 'RECEIVE_STRATEGIES';
export const ERROR_RECEIVE_STRATEGIES = 'ERROR_RECEIVE_STRATEGIES';
export const ERROR_CREATING_STRATEGY = 'ERROR_CREATING_STRATEGY';
export const ERROR_UPDATING_STRATEGY = 'ERROR_UPDATING_STRATEGY';
export const ERROR_REMOVING_STRATEGY = 'ERROR_REMOVING_STRATEGY';
export const ERROR_DEPRECATING_STRATEGY = 'ERROR_DEPRECATING_STRATEGY';
export const ERROR_REACTIVATING_STRATEGY = 'ERROR_REACTIVATING_STRATEGY';
export const UPDATE_STRATEGY_SUCCESS = 'UPDATE_STRATEGY_SUCCESS';

export const receiveStrategies = json => ({
    type: RECEIVE_STRATEGIES,
    value: json,
});

const addStrategy = strategy => ({ type: ADD_STRATEGY, strategy });
const createRemoveStrategy = strategy => ({ type: REMOVE_STRATEGY, strategy });
const updatedStrategy = strategy => ({ type: UPDATE_STRATEGY, strategy });

const startRequest = () => ({ type: REQUEST_STRATEGIES });

const startCreate = () => ({ type: START_CREATE_STRATEGY });

const startUpdate = () => ({ type: START_UPDATE_STRATEGY });

const startDeprecate = () => ({ type: START_DEPRECATE_STRATEGY });
const deprecateStrategyEvent = strategy => ({
    type: DEPRECATE_STRATEGY,
    strategy,
});
const startReactivate = () => ({ type: START_REACTIVATE_STRATEGY });
const reactivateStrategyEvent = strategy => ({
    type: REACTIVATE_STRATEGY,
    strategy,
});

const setInfoMessage = (info, dispatch) => {
    dispatch({
        type: UPDATE_STRATEGY_SUCCESS,
        info: info,
    });
    setTimeout(() => dispatch({ type: MUTE_ERROR, error: info }), 1500);
};

export function fetchStrategies() {
    return dispatch => {
        dispatch(startRequest());

        return api
            .fetchAll()
            .then(json => dispatch(receiveStrategies(json.strategies)))
            .catch(dispatchError(dispatch, ERROR_RECEIVE_STRATEGIES));
    };
}

export function createStrategy(strategy) {
    return dispatch => {
        dispatch(startCreate());

        return api
            .create(strategy)
            .then(() => dispatch(addStrategy(strategy)))
            .then(() => {
                setInfoMessage('Strategy successfully created.', dispatch);
            })
            .catch(e => {
                dispatchError(dispatch, ERROR_CREATING_STRATEGY);
                throw e;
            });
    };
}

export function updateStrategy(strategy) {
    return dispatch => {
        dispatch(startUpdate());

        return api
            .update(strategy)
            .then(() => dispatch(updatedStrategy(strategy)))
            .then(() => {
                setInfoMessage('Strategy successfully updated.', dispatch);
            })
            .catch(dispatchError(dispatch, ERROR_UPDATING_STRATEGY));
    };
}

export function removeStrategy(strategy) {
    return dispatch =>
        api
            .remove(strategy)
            .then(() => dispatch(createRemoveStrategy(strategy)))
            .then(() => {
                setInfoMessage('Strategy successfully deleted.', dispatch);
            })
            .catch(dispatchError(dispatch, ERROR_REMOVING_STRATEGY));
}

export function getApplicationsWithStrategy(strategyName) {
    return applicationApi.fetchApplicationsWithStrategyName(strategyName);
}

export function deprecateStrategy(strategy) {
    return dispatch => {
        dispatch(startDeprecate());
        api.deprecate(strategy)
            .then(() => dispatch(deprecateStrategyEvent(strategy)))
            .then(() =>
                setInfoMessage('Strategy successfully deprecated', dispatch)
            )
            .catch(dispatchError(dispatch, ERROR_DEPRECATING_STRATEGY));
    };
}

export function reactivateStrategy(strategy) {
    return dispatch => {
        dispatch(startReactivate());
        api.reactivate(strategy)
            .then(() => dispatch(reactivateStrategyEvent(strategy)))
            .then(() =>
                setInfoMessage('Strategy successfully reactivated', dispatch)
            )
            .catch(dispatchError(dispatch, ERROR_REACTIVATING_STRATEGY));
    };
}
