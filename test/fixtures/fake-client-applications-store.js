'use strict';

const _appliations = [];

module.exports = () => ({
    upsert: app => {
        _appliations.push(app);
        return Promise.resolve();
    },
    getApplications: () => Promise.resolve(_appliations),
    getApplication: appName => _appliations.filter(a => a.name === appName)[0],
});
