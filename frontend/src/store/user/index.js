import { Map as $Map } from 'immutable';
import { USER_UPDATE_USERNAME, USER_SAVE, USER_EDIT } from './actions';

const COOKIE_NAME = 'username';

// Ref: http://stackoverflow.com/questions/10730362/get-cookie-by-name
function readCookie () {
    const nameEQ = `${COOKIE_NAME}=`;
    const ca = document.cookie.split(';');
    for (let i = 0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') { // eslint-disable-line eqeqeq
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
}

function writeCookie (userName) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userName)}; expires=Thu, 18 Dec 2099 12:00:00 UTC`;
}


function getInitState () {
    const userName = readCookie(COOKIE_NAME);
    const showDialog = !userName;
    return new $Map({ userName, showDialog });
}

function updateUserName (state, action) {
    return state.set('userName', action.value);
}

function save (state) {
    const userName = state.get('userName');
    if (userName) {
        writeCookie(userName);
        return state.set('showDialog', false);
    } else {
        return state;
    }
}

const settingStore = (state = getInitState(), action) => {
    switch (action.type) {
        case USER_UPDATE_USERNAME:
            return updateUserName(state, action);
        case USER_SAVE:
            return save(state);
        case USER_EDIT:
            return state.set('showDialog', true);
        default:
            return state;
    }
};

export default settingStore;
