import api from '../data/strategy-api';

export const ADD_STRATEGY             = 'ADD_STRATEGY';
export const REMOVE_STRATEGY          = 'REMOVE_STRATEGY';
export const REQUEST_STRATEGIES        = 'REQUEST_STRATEGIES';
export const START_CREATE_STRATEGY     = 'START_CREATE_STRATEGY';
export const RECEIVE_STRATEGIES        = 'RECEIVE_STRATEGIES';
export const ERROR_RECEIVE_STRATEGIES  = 'ERROR_RECEIVE_STRATEGIES';
export const ERROR_CREATING_STRATEGY  = 'ERROR_CREATING_STRATEGY';

const addStrategy = (strategy) => ({ type: ADD_STRATEGY, strategy });
const createRemoveStrategy = (strategy) => ({ type: REMOVE_STRATEGY, strategy });

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


export function removeStrategy (strategy) {
    return dispatch => api.remove(strategy)
            .then(() => dispatch(createRemoveStrategy(strategy)))
            .catch(error => dispatch(errorCreatingStrategy(error)));
}


