const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const TWO_DAYS = 48 * 60 * 60 * 1000;
module.exports = function(config) {
    let store;
    let db;
    let age;
    if (config.session) {
        age = config.session.age || TWO_DAYS;
        db = config.session.db || false;
    }
    if (db) {
        store = new KnexSessionStore({
            knex: config.stores.db,
            tablename: 'unleash_session',
            createtable: false,
        });
    } else {
        store = new session.MemoryStore();
    }
    const sessionMiddleware = session({
        name: 'unleash-session',
        rolling: false,
        resave: false,
        saveUninitialized: false,
        store,
        secret: [config.secret],
        cookie: {
            path: config.baseUriPath === '' ? '/' : config.baseUriPath,
            secure: !!config.secureHeaders,
            maxAge: age,
        },
    });
    return (req, res, next) => sessionMiddleware(req, res, next);
};
