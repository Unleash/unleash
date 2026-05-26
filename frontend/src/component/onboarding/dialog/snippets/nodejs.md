1\. Install the SDK
```sh
npm install unleash-client
```

2\. Run Unleash
```js
const { initialize } = require('unleash-client');

const unleash = initialize({
    url: '<YOUR_API_URL>',
    appName: 'unleash-onboarding-node',
    customHeaders: {
        Authorization: '<YOUR_API_TOKEN>' // in production use environment variable
    },
});

setInterval(() => {
    if (unleash.isEnabled('<YOUR_FLAG>')) {
        console.log('<YOUR_FLAG> is enabled');
    } else {
        console.log('<YOUR_FLAG> is disabled');
    }
}, 1000);
```

---
```js
const { initialize } = require('unleash-client');

const unleash = initialize({
    url: '<YOUR_API_URL>',
    appName: 'unleash-onboarding-node',
    customHeaders: { Authorization: process.env.UNLEASH_API_KEY },
});

unleash.on('synchronized', () => {
    console.log('Unleash synchronized');
});
unleash.on('error', console.error);
unleash.on('warn', console.warn);

setInterval(() => {
    if (unleash.isEnabled('<YOUR_FLAG>')) {
        console.log('<YOUR_FLAG> is enabled');
    } else {
        console.log('<YOUR_FLAG> is disabled');
    }
}, 1000);
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-node)
- [Node.js SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Node.js)
- [Node.js SDK tutorial](https://dev.to/reeshee/how-to-implement-feature-flags-in-nodejs-using-unleash-3907)
