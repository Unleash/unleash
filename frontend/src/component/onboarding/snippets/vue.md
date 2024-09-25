1\. Install the SDK
```sh
npm install @unleash/proxy-client-vue
```

2\. Initialize Unleash
```vue
<script setup lang="ts">
    import { FlagProvider } from '@unleash/proxy-client-vue'

    const config = {
        url: '<YOUR_API_URL>',
        clientKey: '<YOUR_API_TOKEN>',
        appName: 'unleash-onboarding-vue',
        refreshInterval: 5, // Use >15s in production
        metricsInterval: 5, // Use >15s in production
    }
</script>

<template>
  <FlagProvider :config="config">
    <!-- <YourComponent /> -->
  </FlagProvider>
</template>
```

3\. Check feature flag status
```vue
<script setup lang="ts">
    import { useFlag } from '@unleash/proxy-client-vue'
    const enabled = useFlag('example-flag')
</script>

<template>
  <div>
    {{ enabled ? 'Feature is enabled!' : 'Feature is disabled!' }}
  </div>
</template>
```
