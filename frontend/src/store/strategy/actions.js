import api from '../../data/strategy-api';
import { fetchApplicationsWithStrategyName } from '../../data/applications-api';

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

const addStrategy = (strategy) => ({ type: ADD_STRATEGY, strategy });
const createRemoveStrategy = (strategy) => ({ type: REMOVE_STRATEGY, strategy });
const updatedStrategy = (strategy) => ({ type: UPDATE_STRATEGY, strategy });

const errorCreatingStrategy = (statusCode) => ({
    type: ERROR_CREATING_STRATEGY,
    statusCode,
});

const startRequest = () => ({ type: REQUEST_STRATEGIES });


const receiveStrategies = (json) => ({
    type: RECEIVE_STRATEGIES,
    value: json.strategies,
});

const startCreate = () => ({ type: START_CREATE_STRATEGY });

const errorReceiveStrategies = (statusCode) => ({
    type: ERROR_RECEIVE_STRATEGIES,
    statusCode,
});

const startUpdate = () => ({ type: START_UPDATE_STRATEGY });

function dispatchAndThrow (dispatch, type) {
    return (error) => {
        dispatch({ type, error, receivedAt: Date.now() });
        throw error;
    };
}

export function fetchStrategies () {
    return dispatch => {
        dispatch(startRequest());

        return api.fetchAll()
            .then(json => dispatch(receiveStrategies(json)))
            .catch(error => dispatch(errorReceiveStrategies(error)));
    };
}

export function createStrategy (strategy) {
    return dispatch => {
        dispatch(startCreate());

        return api.create(strategy)
            .then(() => dispatch(addStrategy(strategy)))
            .catch(error => dispatch(errorCreatingStrategy(error)));
    };
}

export function updateStrategy (strategy) {
    return dispatch => {
        dispatch(startUpdate());

        return api.update(strategy)
            .then(() => dispatch(updatedStrategy(strategy)))
            .catch(dispatchAndThrow(dispatch, ERROR_UPDATING_STRATEGY));
    };
}


export function removeStrategy (strategy) {
    return dispatch => api.remove(strategy)
        .then(() => dispatch(createRemoveStrategy(strategy)))
        .catch(error => dispatch(errorCreatingStrategy(error)));
}

export function getApplicationsWithStrategy (strategyName) {
    return fetchApplicationsWithStrategyName(strategyName);
}

