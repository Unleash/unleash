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
