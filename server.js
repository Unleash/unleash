var app    = require('./app');
var logger = require('./lib/logger');

var server = app.listen(app.get('port'), function() {
    logger.info('unleash started on ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
    logger.error('Uncaught Exception:', err.message);
    logger.error(err.stack);
});

module.exports = {
    app: app,
    server: server
};
