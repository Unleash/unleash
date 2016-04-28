/**
 * TODO: we should also inject config and
 * services to the routes to ease testing.
**/
exports.create = function (app) {
    require('./event')(app);
    require('./feature')(app);
    require('./feature-archive')(app);
    require('./strategy')(app);
    require('./health-check')(app);
};
