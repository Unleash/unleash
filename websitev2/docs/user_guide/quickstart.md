---
id: quickstart
title: Quickstart
---

In this section we will attempt to guide you in order to get started with Unleash easily. There are multiple options to get started with unleash, browse the headings to find the method that works best for you.

## I just want to get started creating toggles without much setup

Usually, you'll need to set up an unleash instance in order to work with unleash. However, for testing purposes we have set up a demo instance that you can use in order to test out different use-cases before setting up your own instance. You can find the demo instance admin panel here: https://unleash.herokuapp.com/

### I want to test toggles in a client side environment

### I want to test toggles in a backend environment

#### Create your first toggle

In order to create a toggle through the UI, [you can follow this guide](./create_feature_toggle). Once you have created your feature toggle, you are ready to connect your application using an SDK.

#### Connecting to the unleash instance from your app

You'll need the following information in order to connect with an SDK:

```
Api URL: https://unleash.herokuapp.com/api/
Secret key: 3bd74da5b341d868443134377ba5d802ea1e6fa2d2a948276ade1f092bec8d92
```

Now you can open up your application code and create a connection to unleash using one of our [SDKs](../sdks). Here's an example using the NodeJS SDK:

```
const { initialize } = require('unleash-client');
const unleash = initialize({
  url: 'http://unleash.herokuapp.com/api/',
  appName: 'my-app-name',
  instanceId: 'my-unique-instance-id',
  customHeaders: {
    Authorization: '3bd74da5b341d868443134377ba5d802ea1e6fa2d2a948276ade1f092bec8d92',
  },
});

unleash.on('synchronized', () => {
  // Unleash is ready to serve updated feature toggles.

  // Check a feature flag
  const isEnabled = unleash.isEnabled('some-toggle');

  // Check the variant
  const variant = unleash.getVariant('app.ToggleY');
});
```

## I want to setup my own instance for testing purposes

With Role-Based Access Control you can now assign groups to users in order to control access. You can control access to root resources in addition to controlling access to [projects](./projects). _Please be aware that all existing users will become "Owner" of all existing projects as part of the migration from v3 to v4._

[Read more](./rbac)

## I want to set up a production ready instance

Addons make it easy to integrate Unleash with other systems. In version 4 we bring two new integrations to Unleash:

- [Microsoft Teams](../addons/teams)
- [Datadog](../addons/datadog)
