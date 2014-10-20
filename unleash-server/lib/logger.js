var log4js = require('log4js');

log4js.clearAppenders();
log4js.addAppender(log4js.appenders.console());

module.exports = log4js.getLogger('unleash');