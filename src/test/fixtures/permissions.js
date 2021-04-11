'use strict';

module.exports = () => {
    const _perms = ['ADMIN'];
    return {
        hook(app) {
            app.use((req, res, next) => {
                req.user = {
                    isAPI: true,
                    id: 1,
                    email: 'unknown',
                    permissions: _perms,
                };
                next();
            });
        },
    };
};
