import { Map as $Map } from 'immutable';
import { UPDATE_USER } from './actions';
import { AUTH_REQUIRED } from '../util';

const userStore = (state = new $Map(), action) => {
    switch (action.type) {
        case UPDATE_USER:
            state = state
                .set('profile', action.value)
                .set('showDialog', false)
                .set('authDetails', undefined);
            return state;
        case AUTH_REQUIRED:
            state = state.set('authDetails', action.error.body).set('showDialog', true);
            return state;
        default:
            return state;
    }
};

export default userStore;
