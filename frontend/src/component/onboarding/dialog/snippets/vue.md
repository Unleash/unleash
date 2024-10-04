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
        clientKey: '<YOUR_API_TOKEN>', // in production use environment variable
        appName: 'unleash-onboarding-vue',
        metricsInterval: 1, // in production remove this or increase to >=15
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
    const enabled = useFlag('<YOUR_FLAG>')
</script>

<template>
  <div>
    {{ enabled ? 'Feature is enabled!' : 'Feature is disabled!' }}
  </div>
</template>
```
---
```svelte
const config = {
    url: '<YOUR_API_URL>',
    clientKey: import.meta.env.VITE_UNLEASH_API_TOKEN,
    appName: 'unleash-onboarding-vue',
}
```

---
- [SDK repository with documentation](https://github.com/Unleash/proxy-client-vue)
- [Vue example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Vue)
