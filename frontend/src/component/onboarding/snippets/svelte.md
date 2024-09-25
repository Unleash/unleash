1\. Install the SDK
```sh
npm install @unleash/proxy-client-svelte
```

2\. Initialize Unleash
```svelte
<script>
	import { FlagProvider } from '@unleash/proxy-client-svelte';

	const config = {
        url: '<YOUR_API_URL>',
        clientKey: '<YOUR_API_TOKEN>',
        appName: 'unleash-onboarding-svelte'
	};
</script>

<div class="app">
	<FlagProvider {config}>
		<main>
			<slot />
		</main>
	</FlagProvider>
</div>
```

3\. Check feature flag status
```svelte
<script lang="ts">
	import { useFlag } from '@unleash/proxy-client-svelte';
	const enabled = useFlag('<YOUR_FLAG>');
</script>

<section>
    <p>
        {$enabled ? 'Feature is enabled!' : 'Feature is disabled!'}
    </p>
</section>
```
