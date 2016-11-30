'use strict';


exports.createAPI = function (router, config) {
    require('./event')(router, config);
    require('./feature')(router, config);
    require('./feature-archive')(router, config);
    require('./strategy')(router, config);
    require('./health-check')(router, config);
    require('./metrics')(router, config);
};

exports.createLegacy = function (router, config) {
    require('./feature')(router, config);
    require('./health-check')(router, config);
    require('./backstage')(router, config);
};
