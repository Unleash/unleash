1\. Install the SDK
```sh
npm install @unleash/proxy-client-svelte
```

2\. Initialize Unleash
```svelte
<script lang="ts">
    import { FlagProvider } from '@unleash/proxy-client-svelte';

    const config = {
        url: '<YOUR_API_URL>',
        clientKey: '<YOUR_API_TOKEN>',
        refreshInterval: 15,
        appName: 'unleash-onboarding-svelte'
    };
</script>

<FlagProvider {config}>
    <App />
</FlagProvider>
```
