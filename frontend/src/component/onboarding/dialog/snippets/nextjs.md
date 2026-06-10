1\. Install the SDK
```sh
npm install @unleash/nextjs
```

2\. Wrap your app with FlagProvider
```jsx
"use client";

import { FlagProvider } from '@unleash/nextjs/client';

const config = {
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>', // in production use environment variables
    appName: 'unleash-onboarding-nextjs',
};

export default function Home() {
    return (
        <FlagProvider config={config}>
            <App />
        </FlagProvider>
    );
}
```

3\. Check feature flag status
```jsx
"use client";

import { useFlag } from '@unleash/nextjs/client';

export default function MyComponent() {
    const isEnabled = useFlag('<YOUR_FLAG>');

    if (isEnabled) {
        return (<div>{'<YOUR_FLAG> is enabled'}</div>);
    } else {
        return (<div>{'<YOUR_FLAG> is disabled'}</div>);
    }
}
```
---
```jsx
// Set NEXT_PUBLIC_UNLEASH_FRONTEND_API_URL, NEXT_PUBLIC_UNLEASH_FRONTEND_API_TOKEN
// and NEXT_PUBLIC_UNLEASH_APP_NAME in your environment
export default function Home() {
    return (
        <FlagProvider>
            <App />
        </FlagProvider>
    );
}
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-sdk-js/tree/main/packages/nextjs)
- [Next.js SDK example](https://github.com/Unleash/unleash-sdk-examples/tree/main/Next.js)
- [https://docs.getunleash.io/guides/implement-feature-flags-in-next-js](https://docs.getunleash.io/guides/implement-feature-flags-in-next-js)

---

```jsx
"use client";

import { useFlag } from '@unleash/nextjs/client';

export default function MyComponent() {
    const isEnabled = useFlag('<YOUR_FLAG>');

    if (isEnabled) {
        return (<div>{'<YOUR_FLAG> is enabled'}</div>);
    } else {
        return (<div>{'<YOUR_FLAG> is disabled'}</div>);
    }
}
```
