const webhook = require('./webhook');
const slackAddon = require('./slack');
const teamsAddon = require('./teams');
const datadogAddon = require('./datadog');

const addons = [webhook, slackAddon, teamsAddon, datadogAddon];

module.exports = addons;
