'use strict';

const NotFoundError = require('../../error/notfound-error');

module.exports = () => {
    let apps = [];

    return {
        upsert: app => {
            apps.push(app);
            return Promise.resolve();
        },
        insertNewRow: value => {
            apps.push(value);
            return Promise.resolve();
        },
        getApplications: () => Promise.resolve(apps),
        getApplication: appName => {
            const app = apps.filter(a => a.appName === appName)[0];
            if (!app) {
                throw new NotFoundError(`Could not find app=${appName}`);
            }
            return app;
        },
        deleteApplication: appName => {
            apps = apps.filter(app => app.appName !== appName);
        },
    };
};
