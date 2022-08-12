---
title: How to use custom activation strategies
---

This guide takes you through how to use [custom activation strategies](../advanced/custom-activation-strategy.md) with Unleash. We'll go through how you define a custom strategy in the admin UI, how you add it to a toggle, and how you'd implement it in a [client SDK](../sdks/index.md).

In this example we want to define an activation strategy offers a scheduled release of a feature toggle. This means that we want the feature toggle to be activated after a given date and time.

## Step 1: Define your custom strategy {#step-1}

1. **Navigate to the strategies view**. Interact with the "Configure" button in the page header and then go to the "Strategies" link in the dropdown menu that appears.

   ![A visual guide for how to navigate to the strategies page in the Unleash admin UI. It shows the steps described in the preceding paragraph.](/img/custom-strategy-navigation.png)

2. **Define your strategy**. Use the "Add new strategy" button to open the strategy creation form. Fill in the form to define your strategy. Refer to [the custom strategy reference documentation](../advanced/custom-activation-strategy.md#definition) for a full list of options.

   ![A strategy creation form. It has fields labeled "strategy name" — "TimeStamp" — and "description" — "activate toggle after a given timestamp". It also has fields for a parameter named "enableAfter". The parameter is of type "string" and the parameter description is "Expected format: YYYY-MM-DD HH:MM". The parameter is required.](/img/timestamp_create_strategy.png)

## Step 2: Apply your custom strategy to a feature toggle {#step-2}

**Navigate to your feature toggle** and **apply the strategy** you just created.

![The strategy configuration screen for the custom "TimeStamp" strategy from the previous step. The "enableAfter" field says "2021-12-25 00:00".](/img/timestamp_use_strategy.png)

## Step 3: Implement the strategy in your client SDK {#step-3}

The steps to implement a custom strategy for your client depend on the kind of client SDK you're using:

- if you're using a server-side client SDK, follow the steps in [option A](#step-3-a 'Step 3 option A: implement the strategy for a server-side client SDK').
- if you're using a front-end client SDK ([Android](../sdks/android-proxy.md), [JavaScript](../sdks/proxy-javascript.md), [React](../sdks/proxy-react.md), [iOS](../sdks/proxy-ios.md)), follow the steps in [option B](#step-3-b 'Step 3 option B: implementing the strategy for a front-end client SDK')

### Option A: Implement the strategy for a server-side client SDK {#step-3-a}

1. **Implement the custom strategy** in your [client SDK](../sdks/index.md). The exact way to do this will vary depending on the specific SDK you're using, so refer to the SDK's documentation. The example below shows an example of how you'd implement a custom strategy called "TimeStamp" for the [Node.js client SDK](../sdks/node.md).

   ```js
   const { Strategy } = require('unleash-client');

   class TimeStampStrategy extends Strategy {
     constructor() {
       super('TimeStamp');
     }

     isEnabled(parameters, context) {
       return Date.parse(parameters.enableAfter) < Date.now();
     }
   }
   ```

2. **Register the custom strategy with the Unleash Client**. When instantiating the Unleash Client, provide it with a list of the custom strategies you'd like to use — again: refer to _your_ client SDK's docs for the specifics.

   Here's a full, working example for Node.js. Notice the `strategies` property being passed to the `initialize` function.

   ```js
   const { Strategy, initialize, isEnabled } = require('unleash-client');

   class TimeStampStrategy extends Strategy {
     constructor() {
       super('TimeStamp');
     }

     isEnabled(parameters, context) {
       return Date.parse(parameters.enableAfter) < Date.now();
     }
   }

   const instance = initialize({
     url: 'http://unleash.herokuapp.com/api/',
     appName: 'unleash-demo',
     instanceId: '1',
     // highlight-next-line
     strategies: [new TimeStampStrategy()],
   });

   instance.on('ready', () => {
     setInterval(() => {
       console.log(isEnabled('demo.TimeStampRollout'));
     }, 1000);
   });
   ```

### Option B: Implement the strategy for a front-end client SDK {#step-3-b}

Front-end client SDKs don't evaluate strategies directly, so you need to implement the **custom strategy in the [Unleash Proxy](../sdks/unleash-proxy.md)**. Depending on how you run the Unleash Proxy, follow one of the below series of steps:

- If you're running the Unleash Proxy as a Docker container, refer to the [steps for using a containerized Proxy](#step-3-b-docker).
- If you're using the Unleash Proxy via Node.js, refer to the [steps for using custom strategies via Node.js](#step-3-b-node).

#### With a containerized proxy {#step-3-b-docker}

Strategies are stored in separate JavaScript files and loaded into the container at startup. Refer to [the Unleash Proxy documentation](../sdks/unleash-proxy.md) for a full overview of all the options.

1. **Create a strategies directory.** Create a directory that Docker has access to where you can store your strategies. The next steps assume you called it `strategies`
2. **Initialize a Node.js project** and **install the Unleash Client**:

   ```shell npm2yarn
   npm init -y && \
   npm install unleash-client
   ```

3. **Create a strategy file** and **implement your strategies**. Remember to **export your list of strategies**. The next steps will assume you called the file `timestamp.js`. An example implementation looks like this:

   ```js
   const { Strategy } = require('unleash-client');

   class TimeStampStrategy extends Strategy {
     constructor() {
       super('TimeStamp');
     }

     isEnabled(parameters, context) {
       return Date.parse(parameters.enableAfter) < Date.now();
     }
   }

   module.exports = [new TimeStampStrategy()]; // <- export strategies
   ```

4. **Mount the strategies directory** and **point the [Unleash Proxy docker container](https://hub.docker.com/r/unleashorg/unleash-proxy) at your strategies file**. The highlighted lines below show the extra options you need to add. The following command assumes that your strategies directory is a direct subdirectory of your current working directory. Modify the rest of the command to suit your needs.

   ```shell
   docker run --name unleash-proxy --pull=always \
       -e UNLEASH_PROXY_CLIENT_KEYS=some-secret \
       -e UNLEASH_URL='http://unleash:4242/api/' \
       -e UNLEASH_API_TOKEN=${API_TOKEN} \
       # highlight-start
       -e UNLEASH_CUSTOM_STRATEGIES_FILE=/strategies/timestamp.js \
       --mount type=bind,source="$(pwd)"/strategies,target=/strategies \
       # highlight-end
       -p 3000:3000 --network unleash unleashorg/unleash-proxy
   ```

#### When running the proxy with Node.js {#step-3-b-node}

The Unleash Proxy accepts a `customStrategies` property as part of its initialization options. Use this to pass it initialized strategies.

1. **Install the `unleash-client` package**. You'll need this to implement the custom strategy:

   ```shell npm2yarn
   npm install unleash-client
   ```

2. **Implement your strategy**. You can import it from a different file or put it in the same file as the Proxy initialization. For instance, a `TimeStampStrategy` could look like this:

   ```js
   const { Strategy } = require('unleash-client');

   class TimeStampStrategy extends Strategy {
     constructor() {
       super('TimeStamp');
     }

     isEnabled(parameters, context) {
       return Date.parse(parameters.enableAfter) < Date.now();
     }
   }
   ```

3. **Pass the strategy to the Proxy Client** using the **`customStrategies`** option. A full code example:

   ```javascript
   const { createApp } = require('@unleash/proxy');
   const { Strategy } = require('unleash-client');

   class TimeStampStrategy extends Strategy {
     constructor() {
       super('TimeStamp');
     }

     isEnabled(parameters, context) {
       return Date.parse(parameters.enableAfter) < Date.now();
     }
   }

   const port = 3000;

   const app = createApp({
     unleashUrl: 'https://app.unleash-hosted.com/demo/api/',
     unleashApiToken:
       '*:default.56907a2fa53c1d16101d509a10b78e36190b0f918d9f122d',
     clientKeys: ['proxy-secret', 'another-proxy-secret', 's1'],
     refreshInterval: 1000,
     // highlight-next-line
     customStrategies: [new TimeStampStrategy()],
   });

   app.listen(port, () =>
     // eslint-disable-next-line no-console
     console.log(`Unleash Proxy listening on http://localhost:${port}/proxy`),
   );
   ```
