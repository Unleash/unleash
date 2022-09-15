---
id: proxy-react
title: React Proxy SDK
---

This library can be used with the [Unleash Proxy](https://github.com/Unleash/unleash-proxy) or with the [Unleash front-end API](../reference/front-end-api). It is _not_ compatible with the regular Unleash client API.

For more detailed information, check out the [React Proxy SDK on GitHub](https://github.com/Unleash/proxy-client-react).

## Installation

Install the React proxy client and the [JavaScript proxy client](proxy-javascript.md) packages:

```shell npm2yarn
npm install @unleash/proxy-client-react unleash-proxy-client
```

## Initialization

The snippet below shows you how to initialize the client. We recommend that you do this in your entry point file (typically index.js/ts) to ensure that you only have _one_ instance of it.

The configuration variables are:

- **`url`**

  Your proxy's URL or the Unleash front-end API endpoint (`<unleash-url>/api/frontend`).

- **`clientKey`**

  One of your proxy's [designated client keys (also known as proxy secrets)](unleash-proxy#configuration-variables).

- **`refreshInterval`**

  How often (in seconds) the client should poll the proxy for updates.

- **`appName`**

  The name of your application. It's only used for identifying your application and can be whatever you want it to be.

- **`environment`**

  The environment that your application runs in. This corresponds to the environment field in [the Unleash Context](../user_guide/unleash-context.md). Note that this is separate from the newer [Environments feature](../user_guide/environments.md).

```jsx
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
  url: 'https://PROXY_HOSTNAME/api/proxy', // or https://UNLEASH_HOSTNAME/api/frontend
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
  document.getElementById('root'),
);
```

## How to check feature toggle states

To check if a feature is enabled:

```jsx
import { useFlag } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const enabled = useFlag('travel.landing');

  if (enabled) {
    return <SomeComponent />;
  }
  return <AnotherComponent />;
};

export default TestComponent;
```

To check variants:

```jsx
import { useVariant } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const variant = useVariant('travel.landing');

  if (variant.enabled && variant.name === 'SomeComponent') {
    return <SomeComponent />;
  } else if (variant.enabled && variant.name === 'AnotherComponent') {
    return <AnotherComponent />;
  }
  return <DefaultComponent />;
};

export default TestComponent;
```

## How to update the Unleash Context

Follow the following steps in order to update the unleash context:

```jsx
import { useUnleashContext, useFlag } from '@unleash/proxy-client-react';

const MyComponent = ({ userId }) => {
  const variant = useFlag('my-toggle');
  const updateContext = useUnleashContext();

  useEffect(() => {
    // context is updated with userId
    updateContext({ userId });
  }, []);
};
```
