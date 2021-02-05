const webhook = require('./webhook');
const slackAddon = require('./slack');

const addons = [webhook, slackAddon];

module.exports = addons;
