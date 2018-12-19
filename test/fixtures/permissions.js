'use strict';

module.exports = () => {
    let _perms = [];
    return {
        hook(app) {
            app.use((req, res, next) => {
                if (req.user) req.user.permissions = _perms;
                else req.user = { email: 'unknown', permissions: _perms };
                next();
            });
        },
        withPerms(...prms) {
            _perms = prms;
        },
    };
};
