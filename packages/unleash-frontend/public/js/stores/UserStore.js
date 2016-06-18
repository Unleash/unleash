'use strict';
let _username;

// Ref: http://stackoverflow.com/questions/10730362/get-cookie-by-name
function readCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') { // eslint-disable-line eqeqeq
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

const UserStore = {
    init() {
        _username = readCookie('username');
    },

    set(username) {
        _username=username;
        document.cookie=`username=${_username}; expires=Thu, 18 Dec 2099 12:00:00 UTC`;
    },

    get() {
        return _username;
    },
};

module.exports = UserStore;
