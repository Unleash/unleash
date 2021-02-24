import { List } from 'immutable';
import { RECEIVE_PROJECT, REMOVE_PROJECT, ADD_PROJECT, UPDATE_PROJECT } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

const DEFAULT_PROJECTS = [{ id: 'default', name: 'Default', initial: true }];

function getInitState() {
    return new List(DEFAULT_PROJECTS);
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_PROJECT:
            return new List(action.value);
        case REMOVE_PROJECT: {
            const index = state.findIndex(item => item.id === action.project.id);
            return state.remove(index);
        }
        case ADD_PROJECT:
            return state.push(action.project);
        case UPDATE_PROJECT: {
            const index = state.findIndex(item => item.id === action.project.id);
            return state.set(index, action.project);
        }
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default strategies;
