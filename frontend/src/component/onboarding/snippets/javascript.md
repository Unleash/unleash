1\. Install the SDK
```sh
npm install unleash-proxy-client
```

2\. Initialize Unleash
```js
import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-javascript',
});

// Start the background polling
unleash.start();
```
