---
id: proxy-vue
title: Vue Proxy SDK
---

<div class="alert alert--info" role="alert">
  <em>Vue Proxy SDK is currently at version 0.0.1 and is experimental</em>.
</div>
<br/>

This library can be used with the [Unleash Proxy](https://github.com/Unleash/unleash-proxy) or with the [Unleash front-end API](../reference/front-end-api). It is _not_ compatible with the regular Unleash client API.

For more detailed information, check out the [Vue Proxy SDK on GitHub](https://github.com/Unleash/proxy-client-vue).

## Installation

```shell npm2yarn
npm install @unleash/proxy-client-vue
```

## Initialization

Import the provider like this in your entrypoint file (typically App.vue):

```jsx
import { FlagProvider } from '@unleash/proxy-client-vue'

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev'
}

<template>
  <FlagProvider :config="config">
    <App />
  </FlagProvider>
</template>
```

Alternatively, you can pass your own client in to the FlagProvider:

```jsx
import { FlagProvider, UnleashClient } from '@unleash/proxy-client-vue'

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev'
}

const client = new UnleashClient(config)

<template>
  <FlagProvider :unleash-client="client">
    <App />
  </FlagProvider>
</template>
```

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can delay the polling by:

- setting the `startClient` prop to `false`
- passing a client instance to the `FlagProvider`

```jsx
<template>
  <FlagProvider :unleash-client="client" :start-client="false">
    <App />
  </FlagProvider>
</template>
```

Deferring the client start gives you more fine-grained control over when to start fetching the feature toggle configuration. This could be handy in cases where you need to get some other context data from the server before fetching toggles, for instance.

To start the client, use the client's `start` method. The below snippet of pseudocode will defer polling until the end of the `asyncProcess` function.

```jsx
const client = new UnleashClient({
  /* ... */
})

onMounted(() => {
  const asyncProcess = async () => {
    // do async work ...
    client.start()
  }
  asyncProcess()
})

<template>
  <FlagProvider :unleash-client="client" :start-client="false">
    <App />
  </FlagProvider>
</template>
```

## Usage

### Check feature toggle status

To check if a feature is enabled:

```jsx
<script setup>
import { useFlag } from '@unleash/proxy-client-vue'

const enabled = useFlag('travel.landing')
</script>

<template>
  <SomeComponent v-if="enabled" />
  <AnotherComponent v-else />
</template>
```

### Check variants

To check variants:

```jsx
<script setup>
import { useVariant } from '@unleash/proxy-client-vue'

const variant = useVariant('travel.landing')
</script>

<template>
  <SomeComponent v-if="variant.enabled && variant.name === 'SomeComponent'" />
  <AnotherComponent v-else-if="variant.enabled && variant.name === 'AnotherComponent" />
  <DefaultComponent v-else />
</template>
```

### Defer rendering until flags fetched

useFlagsStatus retrieves the ready state and error events. Follow the following steps in order to delay rendering until the flags have been fetched.

```jsx
import { useFlagsStatus } from '@unleash/proxy-client-vue'

const { flagsReady, flagsError } = useFlagsStatus()

<Loading v-if="!flagsReady" />
<MyComponent v-else error={flagsError} />
```

### Updating context

Follow the following steps in order to update the unleash context:

```jsx
import { useUnleashContext, useFlag } from '@unleash/proxy-client-vue'

const props = defineProps<{
  userId: string
}>()

const { userId } = toRefs(props)

const updateContext = useUnleashContext()

onMounted(() => {
  updateContext({ userId })
})

watch(userId, () => {
  async function run() {
    await updateContext({ userId: userId.value })
    console.log('new flags loaded for', userId.value)
  }
  run()
})
```
