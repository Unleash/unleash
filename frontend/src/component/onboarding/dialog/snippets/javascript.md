1\. Install the SDK
```sh
npm install unleash-proxy-client
```

2\. Run Unleash
```js
const { UnleashClient } = require('unleash-proxy-client');

const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>', // in production use environment variable
    appName: 'unleash-onboarding-javascript',
});

unleash.start();

unleash.on('update', () => {
    if (unleash.isEnabled('<YOUR_FLAG>')) {
        console.log('<YOUR_FLAG> is enabled');
    } else {
        console.log('<YOUR_FLAG> is disabled');
    }
});
```
---
```js
const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: process.env.UNLEASH_API_TOKEN,
    appName: 'unleash-onboarding-javascript',
});

unleash.on('update', () => {
    if (unleash.isEnabled('<YOUR_FLAG>')) {
        console.log('<YOUR_FLAG> is enabled');
    } else {
        console.log('<YOUR_FLAG> is disabled');
    }
});

unleash.start();
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-proxy-client-js)
- [JavaScript SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/JavaScript)
