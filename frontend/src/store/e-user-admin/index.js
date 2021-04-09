import { List } from 'immutable';
import { RECEIVE_USERS, ADD_USER, REMOVE_USER, UPDATE_USER } from './actions';

const store = (state = new List(), action) => {
    switch (action.type) {
        case RECEIVE_USERS:
            return new List(action.value.users);
        case ADD_USER:
            return state.push(action.user);
        case UPDATE_USER:
            return state.map(user => {
                if (user.id === action.user.id) {
                    return action.user;
                } else {
                    return user;
                }
            });
        case REMOVE_USER:
            return state.filter(v => v.id !== action.user.id);
        default:
            return state;
    }
};

export default store;
