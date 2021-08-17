---
id: proxy-react
title: React proxy SDK
---

> This library is meant to be used with the [unleash-proxy](https://github.com/Unleash/unleash-proxy). The proxy application layer will sit between your unleash instance and your client applications, and provides performance and security benefits. DO NOT TRY to connect this library directly to the unleash instance, as the datasets follow different formats because the proxy only returns evaluated toggle information.

# Installation

```
npm install @unleash/proxy-client-react
// or
yarn add @unleash/proxy-client-react
```

Import the provider like this in your entrypoint file (typically index.js/ts):

```
import FlagProvider from '@unleash/proxy-client-react';

const config = {
  url: 'https://HOSTNAME/api/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev',
};

ReactDOM.render(
  <React.StrictMode>
    <FlagProvider config={config}>
      <App />
    </FlagProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

To check if a feature is enabled:

```
import { useFlag } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const enabled = useFlag('travel.landing');

  if (enabled) {
    return <SomeComponent />
  }
  return <AnotherComponent />
};

export default TestComponent;
```

To check variants:

```
import { useVariant } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const variant = useVariant('travel.landing');

  if (variant.enabled && variant.name === "SomeComponent") {
    return <SomeComponent />
  } else if (variant.enabled && variant.name === "AnotherComponent") {
    return <AnotherComponent />
  }
  return <DefaultComponent />
};

export default TestComponent;
```

## Updating context

Follow the following steps in order to update the unleash context:

```
import { useUnleashContext, useFlag } from '@unleash/proxy-client-react'

const MyComponent = ({ userId }) => {
  const variant = useFlag("my-toggle");
  const updateContext = useUnleashContext();

  useEffect(() => {
    // context is updated with userId
    updateContext({ userId })
  }, [])
}

```
