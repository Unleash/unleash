'use strict';

module.exports = () => {
    const apps = [];

    return {
        upsert: app => {
            apps.push(app);
            return Promise.resolve();
        },
        getApplications: () => Promise.resolve(apps),
        getApplication: appName => apps.filter(a => a.name === appName)[0],
    };
};
