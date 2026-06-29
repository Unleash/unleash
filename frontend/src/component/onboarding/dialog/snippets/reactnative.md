1\. Install the SDK
```sh
npm install @unleash/unleash-react-native-sdk unleash-proxy-client
```

2\. Initialize Unleash
```tsx
import { FlagProvider, useFlag } from '@unleash/unleash-react-native-sdk';

const config = {
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>', // in production use environment variables
    appName: 'unleash-onboarding-react-native',
};

function FlagStatus() {
    const isEnabled = useFlag('<YOUR_FLAG>');

    if (isEnabled) {
        return <Text>{'<YOUR_FLAG> is enabled'}</Text>;
    } else {
        return <Text>{'<YOUR_FLAG> is disabled'}</Text>;
    }
}

export default function App() {
    return (
        <FlagProvider config={config}>
            <FlagStatus />
        </FlagProvider>
    );
}
```
---
```tsx
// Use environment variables instead of hardcoded values.
// The variable names depend on your setup (e.g. EXPO_PUBLIC_* for Expo,
// or your chosen library for bare React Native).
const config = {
    url: process.env.YOUR_UNLEASH_URL,
    clientKey: process.env.YOUR_UNLEASH_CLIENT_KEY,
    appName: 'unleash-onboarding-react-native',
};
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-react-native-sdk)
- [React Native SDK example](https://github.com/Unleash/unleash-sdk-examples/tree/main/ReactNative)
- [https://docs.getunleash.io/sdks/react-native](https://docs.getunleash.io/sdks/react-native)

---

```tsx
import { useFlag } from '@unleash/unleash-react-native-sdk';

function MyComponent() {
    const isEnabled = useFlag('<YOUR_FLAG>');

    if (isEnabled) {
        return <Text>{'<YOUR_FLAG> is enabled'}</Text>;
    } else {
        return <Text>{'<YOUR_FLAG> is disabled'}</Text>;
    }
}
```
