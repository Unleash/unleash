const webhook = require('./webhook');
const slackAddon = require('./slack');
const teamsAddon = require('./teams');

const addons = [webhook, slackAddon, teamsAddon];

module.exports = addons;
