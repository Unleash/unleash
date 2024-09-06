import type { SdkName } from './sharedTypes';

export const installCommands: Record<SdkName, string> = {
    'Node.js': ' npm install unleash-client',
    Go: 'go get github.com/Unleash/unleash-client-go/v3',
    Ruby: 'gem install unleash',
    PHP: 'composer require unleash/client',
    Rust: 'cargo add unleash-client',
    '.NET': `dotnet add package unleash.client
// If you do not have a json library in your project:
dotnet add package Newtonsoft.Json`,
    Java: `<dependency>
    <groupId>io.getunleash</groupId>
    <artifactId>unleash-client-java</artifactId>
    <version>Latest version here</version>
</dependency>`,
    Python: 'pip install UnleashClient',
    JavaScript: 'npm install unleash-proxy-client',
    React: 'npm install @unleash/proxy-client-react unleash-proxy-client',
    Vue: 'npm install @unleash/proxy-client-vue',
    Svelte: 'npm install @unleash/proxy-client-svelte',
    Swift: 'https://github.com/Unleash/unleash-proxy-client-swift',
    Android: `implementation("io.getunleash:unleash-android:\${unleash.sdk.version}")

// enabled required permissions
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`,
    Flutter: 'flutter pub add unleash_proxy_client_flutter',
};

export const initializeCodeSnippets: Record<SdkName, string> = {
    'Node.js': `import { initialize } from 'unleash-client';

const unleash = initialize({
  url: '<YOUR_API_URL>',
  appName: 'unleash-onboarding-node',
  customHeaders: { Authorization: '<YOUR_API_TOKEN>' },
});
`,
    Golang: `import (
    "github.com/Unleash/unleash-client-go/v3"
)

func init() {
    unleash.Initialize(
        unleash.WithListener(&unleash.DebugListener{}),
        unleash.WithAppName("unleash-onboarding-golang"),
        unleash.WithUrl("<YOUR_API_URL>"),
        unleash.WithCustomHeaders(http.Header{"Authorization": {"<YOUR_API_TOKEN>"}}),
    )
}`,
    Ruby: `Unleash.configure do |config|
  config.app_name            = 'unleash-onboarding-ruby'
  config.url                 = '<YOUR_API_URL>'
  config.custom_http_headers = {'Authorization': '<YOUR_API_TOKEN>'}
end`,
    PHP: `<?php

use Unleash\\Client\\UnleashBuilder;

$unleash = UnleashBuilder::create()
    ->withAppName('unleash-onboarding-php')
    ->withAppUrl('<YOUR_API_URL>')
    ->withHeader('Authorization', '<YOUR_API_TOKEN>')
    ->withInstanceId('unleash-onboarding-instance')
    ->build();`,
    Rust: `let client = client::ClientBuilder::default()
    .interval(500)
    .into_client::<UserFeatures, reqwest::Client>(
        "<YOUR_API_URL>",
        "unleash-onboarding-rust",
        "unleash-onboarding-instance",
        "<YOUR_API_TOKEN>",
    )?;
client.register().await?;`,
    DotNet: `using Unleash;
var settings = new UnleashSettings()
{
    AppName = "unleash-onboarding-dotnet",
    UnleashApi = new Uri("<YOUR_API_URL>"),
    CustomHttpHeaders = new Dictionary<string, string>()
    {
      {"Authorization","<YOUR_API_TOKEN>" }
    }
};`,
    Java: `UnleashConfig config = UnleashConfig.builder()
        .appName("unleash-onboarding-java")
        .instanceId("unleash-onboarding-instance")
        .unleashAPI("<YOUR_API_URL>")
        .apiKey("<YOUR_API_TOKEN>")
        .build();

Unleash unleash = new DefaultUnleash(config);`,
    Python: `from UnleashClient import UnleashClient

client = UnleashClient(
    url="<YOUR_API_URL>",
    app_name="unleash-onboarding-python",
    custom_headers={'Authorization': '<YOUR_API_TOKEN>"'})

client.initialize_client()`,
    Javascript: `import { UnleashClient } from 'unleash-proxy-client';

const unleash = new UnleashClient({
    url: '<YOUR_API_URL>',
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-javascript',
});

// Start the background polling
unleash.start();`,
    React: `import { createRoot } from 'react-dom/client';
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
  url: '<YOUR_API_URL>',
  clientKey: '<YOUR_API_TOKEN>',
  refreshInterval: 15,
  appName: 'unleash-onboarding-react',
};

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FlagProvider config={config}>
      <App />
    </FlagProvider>
  </React.StrictMode>
);`,
    Vue: `import { createApp } from 'vue'
import { plugin as unleashPlugin } from '@unleash/proxy-client-vue'
// import the root component App from a single-file component.
import App from './App.vue'

const config = {
  url: '<YOUR_API_URL>'',
  clientKey: '<YOUR_API_TOKEN>',
  refreshInterval: 15,
  appName: 'unleash-onboarding-vue',
}

const app = createApp(App)
app.use(unleashPlugin, { config })
app.mount('#app')`,
    Svelte: `<script lang="ts">
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
</FlagProvider>`,
    Swift: `import SwiftUI
import UnleashProxyClientSwift

var unleash = UnleashProxyClientSwift.UnleashClient(
   unleashUrl: "<YOUR_API_URL>",
   clientKey: "<YOUR_API_TOKEN>",
   refreshInterval: 15,
   appName: "unleash-onboarding-swift",
   context: [:])

unleash.start()`,
    Android: `val unleash = DefaultUnleash(
    androidContext = applicationContext, // likely a reference to your Android application context
    unleashConfig =  UnleashConfig.newBuilder(appName = "unleash-onboarding-android")
        .proxyUrl("<YOUR_API_URL>")
        .clientKey("<YOUR_API_TOKEN>")
        .pollingStrategy.interval(3000)
        .metricsStrategy.interval(3000)
        .build()
)`,
    Flutter: `import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';

final unleash = UnleashClient(
    url: Uri.parse('<YOUR_API_URL>'),
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-flutter');`,
};

// TODO: add idiomatic way of checking flag status that will populate metrics
export const checkFlagCodeSnippets: Record<SdkName, string> = {
    'Node.js': `setInterval(() => {
  console.log('Is enabled', unleash.isEnabled('<YOUR_FLAG>'));
}, 1000);
`,
    Go: ``,
    Ruby: ``,
    PHP: ``,
    Rust: ``,
    '.NET': ``,
    Java: ``,
    Python: ``,
    JavaScript: ``,
    React: ``,
    Vue: ``,
    Svelte: ``,
    Swift: ``,
    Android: ``,
    Flutter: ``,
};
