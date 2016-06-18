/**
 * TODO: we should also inject config and
 * services to the routes to ease testing.
**/
exports.create = function (app, config) {
    require('./event')(app, config);
    require('./feature')(app, config);
    require('./feature-archive')(app, config);
    require('./strategy')(app, config);
    require('./health-check')(app, config);
};
