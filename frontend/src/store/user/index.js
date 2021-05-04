import { Map as $Map } from 'immutable';
import { USER_CHANGE_CURRENT, USER_LOGOUT } from './actions';
import { AUTH_REQUIRED } from '../util';

const userStore = (state = new $Map({permissions: []}), action) => {
    switch (action.type) {
        case USER_CHANGE_CURRENT:
            state = state
                .set('profile', action.value.user)
                .set('permissions', action.value.permissions || [])
                .set('showDialog', false)
                .set('authDetails', undefined);
            return state;
        case AUTH_REQUIRED:
            state = state
                .set('authDetails', action.error.body)
                .set('showDialog', true);
            return state;
        case USER_LOGOUT:
            return new $Map({permissions: []});
        default:
            return state;
    }
};

export default userStore;
