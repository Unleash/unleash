---
id: feature_updates_to_slack
title: Feature Updates To slack
---

:::caution

This guide is deprecated. If you're looking for ways to integrate with Slack, you should refer to [the Slack add-on guide](../addons/slack.md) instead.

:::

## Create a custom Slack WebHook url: {#create-a-custom-slack-webhook-url}

1. Go to [https://slack.com/apps/manage/custom-integrations](https://slack.com/apps/manage/custom-integrations)
1. Click Incoming WebHooks
1. Click “Add Configuration”
1. This is Slack's help page on how to do this: https://api.slack.com/messaging/webhooks
   - Choose a channel, follow the wizard, get the custom URL.

## Send data to Slack using an event hook function {#send-data-to-slack-using-an-event-hook-function}

Using the `eventHook` option, create a function that will send the data you'd like into Slack when mutation events happen.

```javascript
const unleash = require('unleash-server');
const axios = require('axios');

function onEventHook(event, eventData) {
  const { createdBy: user, data } = eventData;
  let text = '';

  const unleashUrl = 'http://your.unleash.host.com';
  const feature = `<${unleashUrl}/#/features/strategies/${data.name}|${data.name}>`;

  switch (event) {
    case 'feature-created':
    case 'feature-updated': {
      const verb =
        event === 'feature-created' ? 'created a new' : 'updated the';
      text = `${user} ${verb} feature ${feature}\ndescription: ${
        data.description
      }\nenabled: ${data.enabled}\nstrategies: \`${JSON.stringify(
        data.strategies,
      )}\``;
      break;
    }
    case 'feature-archived':
    case 'feature-revived': {
      const verb = event === 'feature-archived' ? 'archived' : 'revived';
      text = `${user} ${verb} the feature ${feature}`;
      break;
    }
    default: {
      console.error(`Unknown event ${event}`);
      return;
    }
  }

  axios
    .post(
      'https://hooks.slack.com/services/THIS_IS_WHERE_THE_CUSTOM_URL_GOES',
      {
        username: 'Unleash',
        icon_emoji: ':unleash:', // if you added a custom emoji, otherwise you can remove this field.
        text: text,
      },
    )
    .then((res) => {
      console.log(`Slack post statusCode: ${res.status}. Text: ${text}`);
    })
    .catch((error) => {
      console.error(error);
    });
}

const options = {
  eventHook: onEventHook,
};

unleash.start(options).then((server) => {
  console.log(`Unleash started on http://localhost:${server.app.get('port')}`);
});
```
