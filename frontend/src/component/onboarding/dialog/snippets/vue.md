1\. Install the SDK
```sh
npm install @unleash/proxy-client-vue
```

2\. Initialize Unleash
<<<<<<< HEAD:frontend/src/component/onboarding/snippets/vue.md
```vue
<script setup lang="ts">
    import { FlagProvider } from '@unleash/proxy-client-vue'

    const config = {
        url: '<YOUR_API_URL>',
        clientKey: '<YOUR_API_TOKEN>',
        appName: 'unleash-onboarding-vue',
        refreshInterval: 5,
        metricsInterval: 5,
    }
</script>
=======

```js
import { createApp } from 'frontend/src/component/onboarding/dialog/snippets/vue'
import { plugin as unleashPlugin } from '@unleash/proxy-client-vue'
// import the root component App from a single-file component.
import App from './App.vue'

const config = {
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>',
    refreshInterval: 15,
    appName: 'unleash-onboarding-vue',
}
>>>>>>> main:frontend/src/component/onboarding/dialog/snippets/vue.md

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
