const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

module.exports = function(config) {
    let store;
    if (config.dbSession === true) {
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
            maxAge: config.sessionAge,
        },
    });
    return (req, res, next) => sessionMiddleware(req, res, next);
};
