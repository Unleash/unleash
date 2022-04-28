---
id: proxy-svelte
title: Svelte proxy SDK
---

<div class="alert alert--info" role="alert">
  <em>Svelte proxy SDK is currently at version 0.0.1 and is experimental</em>.
</div>
<br/>

This library is meant to be used with the [unleash-proxy](https://github.com/Unleash/unleash-proxy). The proxy application layer will sit between your unleash instance and your client applications, and provides performance and security benefits. DO NOT TRY to connect this library directly to the unleash instance, as the datasets follow different formats because the proxy only returns evaluated toggle information.

For more detailed information, check out [the svelte Proxy SDK on GitHub](https://github.com/Unleash/proxy-client-svelte).

## Installation

```shell npm2yarn
npm install @unleash/proxy-client-svelte
```

## Initialization

Import the provider like this in your entrypoint file (typically index.svelte):

```html
<script lang="ts">
	let FlagProvider;

	onMount(async () => {
		const proxyClientSvelte = await import('@unleash/proxy-client-svelte');
		FlagProvider = proxyClientSvelte.default;
	});

	const config = {
		url: 'https://HOSTNAME/proxy',
		clientKey: 'PROXYKEY',
		refreshInterval: 15,
		appName: 'your-app-name',
		environment: 'dev'
	};
</script>

<svelte:component this="{FlagProvider}" {config}>
	<App />
</svelte:component>
```

Alternatively, you can pass your own client in to the FlagProvider:

```html
<script lang="ts">
	import { UnleashClient } from '@unleash/proxy-client-svelte';

	let FlagProvider;

	onMount(async () => {
		const proxyClientSvelte = await import('@unleash/proxy-client-svelte');
		FlagProvider = proxyClientSvelte.default;
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

<svelte:component this="{FlagProvider}" unleashClient="{client}">
	<App />
</svelte:component>
```

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can delay the polling by:

- setting the `startClient` prop to `false`
- passing a client instance to the `FlagProvider`

```html
<svelte:component this="{FlagProvider}" unleashClient="{client}" startClient="{false}">
	<App />
</svelte:component>
```

Deferring the client start gives you more fine-grained control over when to start fetching the feature toggle configuration. This could be handy in cases where you need to get some other context data from the server before fetching toggles, for instance.

To start the client, use the client's `start` method. The below snippet of pseudocode will defer polling until the end of the `asyncProcess` function.

```html
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

<svelte:component this="{FlagProvider}" unleashClient="{client}" startClient="{false}">
	<App />
</svelte:component>
```

## Usage

## Check feature toggle status

To check if a feature is enabled:

```html
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

## Check variants

To check variants:

```html
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

## Defer rendering until flags fetched

useFlagsStatus retrieves the ready state and error events.
Follow the following steps in order to delay rendering until the flags have been fetched.

```html
<script lang="ts">
	import { useFlagsStatus } from '@unleash/proxy-client-svelte';
	const { flagsReady, flagsError } = useFlagsStatus();
</script>

{#if !$flagsReady}
<Loading />
{:else}
<MyComponent error="{flagsError}" />
{/if}
```

## Updating context

Follow the following steps in order to update the unleash context:

```html
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