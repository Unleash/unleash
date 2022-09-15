---
id: proxy-svelte
title: Svelte Proxy SDK
---

<div class="alert alert--info" role="alert">
  <em>Svelte Proxy SDK is currently at version 0.0.2 and is experimental</em>.
</div>
<br/>

This library can be used with the [Unleash Proxy](https://github.com/Unleash/unleash-proxy) or with the [Unleash front-end API](../reference/front-end-api). It is _not_ compatible with the regular Unleash client API.

For more detailed information, check out the [Svelte Proxy SDK on GitHub](https://github.com/Unleash/proxy-client-svelte).

## Installation

```shell npm2yarn
npm install @unleash/proxy-client-svelte
```

## Initialization

Import the provider like this in your entrypoint file (typically index.svelte):

```jsx
<script lang="ts">
	let FlagProvider;

	onMount(async () => {
		const proxyClientSvelte = await import('@unleash/proxy-client-svelte');
		({ FlagProvider } = proxyClientSvelte);
	});

	const config = {
		url: 'https://HOSTNAME/proxy',
		clientKey: 'PROXYKEY',
		refreshInterval: 15,
		appName: 'your-app-name',
		environment: 'dev'
	};
</script>

<svelte:component this={FlagProvider} {config}>
	<App />
</svelte:component>
```

Alternatively, you can pass your own client in to the FlagProvider:

```jsx
<script lang="ts">
	import { UnleashClient } from '@unleash/proxy-client-svelte';

	let FlagProvider;

	onMount(async () => {
		const proxyClientSvelte = await import('@unleash/proxy-client-svelte');
		({ FlagProvider } = proxyClientSvelte);
	});

	const config = {
		url: 'https://HOSTNAME/proxy',
		clientKey: 'PROXYKEY',
		refreshInterval: 15,
		appName: 'your-app-name',
		environment: 'dev'
	};

	const client = new UnleashClient(config);
</script>

<svelte:component this={FlagProvider} unleashClient={client}>
	<App />
</svelte:component>
```

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can delay the polling by:

- setting the `startClient` prop to `false`
- passing a client instance to the `FlagProvider`

```jsx
<svelte:component
  this={FlagProvider}
  unleashClient={client}
  startClient={false}
>
  <App />
</svelte:component>
```

Deferring the client start gives you more fine-grained control over when to start fetching the feature toggle configuration. This could be handy in cases where you need to get some other context data from the server before fetching toggles, for instance.

To start the client, use the client's `start` method. The below snippet of pseudocode will defer polling until the end of the `asyncProcess` function.

```jsx
<script lang="ts">
	const client = new UnleashClient({
		/* ... */
	});

	onMount(() => {
		const asyncProcess = async () => {
			// do async work ...
			client.start();
		};
		asyncProcess();
	});
</script>

<svelte:component this={FlagProvider} unleashClient={client} startClient={false}>
	<App />
</svelte:component>
```

## Usage

### Check feature toggle status

To check if a feature is enabled:

```jsx
<script lang="ts">
	import { useFlag } from '@unleash/proxy-client-svelte';

	const enabled = useFlag('travel.landing');
</script>

{#if $enabled}
<SomeComponent />
{:else}
<AnotherComponent />
{/if}
```

### Check variants

To check variants:

```jsx
<script lang="ts">
	import { useVariant } from '@unleash/proxy-client-svelte';

	const variant = useVariant('travel.landing');
</script>

{#if $variant.enabled && $variant.name === 'SomeComponent'}
<SomeComponent />
{:else if $variant.enabled && $variant.name === 'AnotherComponent'}
<AnotherComponent />
{:else}
<DefaultComponent />
{/if}
```

### Defer rendering until flags fetched

useFlagsStatus retrieves the ready state and error events. Follow the following steps in order to delay rendering until the flags have been fetched.

```jsx
<script lang="ts">
	import { useFlagsStatus } from '@unleash/proxy-client-svelte';
	const { flagsReady, flagsError } = useFlagsStatus();
</script>

{#if !$flagsReady}
<Loading />
{:else}
<MyComponent error={flagsError} />
{/if}
```

### Updating context

Follow the following steps in order to update the unleash context:

```jsx
<script lang="ts">
	import { useUnleashContext, useFlag } from '@unleash/proxy-client-svelte';

	export let userId: string = undefined;

	const updateContext = useUnleashContext();

	onMount(() => {
		updateContext({ userId });
	});

	$: {
		async function run() {
			await updateContext({ userId });
			console.log('new flags loaded for', userId);
		}
		run();
	}
</script>
```
