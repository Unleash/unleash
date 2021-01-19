const webhook = require('./webhook');
const slackAddon = require('./slack');
const jiraAddon = require('./jira-comment');

module.exports = [webhook, slackAddon, jiraAddon];
