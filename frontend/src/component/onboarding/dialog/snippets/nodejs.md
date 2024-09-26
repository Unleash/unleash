1\. Install the SDK
```sh
npm install unleash-client
```

2\. Initialize Unleash
```js
const { initialize } = require('unleash-client');

const unleash = initialize({
  url: '<YOUR_API_URL>',
  appName: 'unleash-onboarding-node',
  customHeaders: { Authorization: '<YOUR_API_TOKEN>' },
  metricsInterval: 5000,
});
```

3\. Check feature flag status
```js
setInterval(() => {
  console.log('Is enabled', unleash.isEnabled('<YOUR_FLAG>'));
}, 1000);
```

---
### Production settings

In order to validate the connection, we changed some settings that you might want to revert. We recommend the following default settings.

```js
const { initialize } = require('unleash-client');

const unleash = initialize({
    url: '<YOUR_API_URL>',
    appName: 'unleash-onboarding-node',
    customHeaders: { Authorization: process.env.UNLEASH_API_KEY  },
});
```

---
### Additional resources

Now that we’ve validated the connection, you might want to look into more advanced use cases and examples:

- [SDK repository with documentation](https://github.com/Unleash/unleash-client-node)
- [Node.js SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/JavaScript)
- [Node.js SDK tutorial](https://dev.to/reeshee/how-to-implement-feature-flags-in-nodejs-using-unleash-3907)
