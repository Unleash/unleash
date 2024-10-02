1\. Install the SDK
```sh
npm install unleash-proxy-client
```

2\. Run Unleash
```js
const { UnleashClient } = require('unleash-proxy-client');

const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-javascript',
    metricsInterval: 1000,
});

unleash.start();

setInterval(() => {
    console.log('Is enabled', unleash.isEnabled('<YOUR_FLAG>'));
}, 1000);
```
---
```js
const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: process.env.UNLEASH_API_TOKEN,
    appName: 'unleash-onboarding-javascript',
});
unleash.start();
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-proxy-client-js)
- [JavaScript SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/JavaScript)
