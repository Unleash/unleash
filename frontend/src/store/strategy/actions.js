import api from '../../data/strategy-api';
import applicationApi from '../../data/applications-api';
import { dispatchAndThrow } from '../util';

export const ADD_STRATEGY = 'ADD_STRATEGY';
export const UPDATE_STRATEGY = 'UPDATE_STRATEGY';
export const REMOVE_STRATEGY = 'REMOVE_STRATEGY';
export const REQUEST_STRATEGIES = 'REQUEST_STRATEGIES';
export const START_CREATE_STRATEGY = 'START_CREATE_STRATEGY';
export const START_UPDATE_STRATEGY = 'START_UPDATE_STRATEGY';
export const RECEIVE_STRATEGIES = 'RECEIVE_STRATEGIES';
export const ERROR_RECEIVE_STRATEGIES = 'ERROR_RECEIVE_STRATEGIES';
export const ERROR_CREATING_STRATEGY = 'ERROR_CREATING_STRATEGY';
export const ERROR_UPDATING_STRATEGY = 'ERROR_UPDATING_STRATEGY';
export const ERROR_REMOVING_STRATEGY = 'ERROR_REMOVING_STRATEGY';

const addStrategy = strategy => ({ type: ADD_STRATEGY, strategy });
const createRemoveStrategy = strategy => ({ type: REMOVE_STRATEGY, strategy });
const updatedStrategy = strategy => ({ type: UPDATE_STRATEGY, strategy });

const startRequest = () => ({ type: REQUEST_STRATEGIES });

const receiveStrategies = json => ({
    type: RECEIVE_STRATEGIES,
    value: json.strategies,
});

const startCreate = () => ({ type: START_CREATE_STRATEGY });

const startUpdate = () => ({ type: START_UPDATE_STRATEGY });

export function fetchStrategies() {
    return dispatch => {
        dispatch(startRequest());

        return api
            .fetchAll()
            .then(json => dispatch(receiveStrategies(json)))
            .catch(dispatchAndThrow(dispatch, ERROR_RECEIVE_STRATEGIES));
    };
}

export function createStrategy(strategy) {
    return dispatch => {
        dispatch(startCreate());

        return api
            .create(strategy)
            .then(() => dispatch(addStrategy(strategy)))
            .catch(dispatchAndThrow(dispatch, ERROR_CREATING_STRATEGY));
    };
}

export function updateStrategy(strategy) {
    return dispatch => {
        dispatch(startUpdate());

        return api
            .update(strategy)
            .then(() => dispatch(updatedStrategy(strategy)))
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATING_STRATEGY));
    };
}

export function removeStrategy(strategy) {
    return dispatch =>
        api
            .remove(strategy)
            .then(() => dispatch(createRemoveStrategy(strategy)))
            .catch(dispatchAndThrow(dispatch, ERROR_REMOVING_STRATEGY));
}

export function getApplicationsWithStrategy(strategyName) {
    return applicationApi.fetchApplicationsWithStrategyName(strategyName);
}
