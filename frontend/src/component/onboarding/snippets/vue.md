1\. Install the SDK
```sh
npm install @unleash/proxy-client-vue
```

2\. Initialize Unleash
```js
import { createApp } from 'vue'
import { plugin as unleashPlugin } from '@unleash/proxy-client-vue'
// import the root component App from a single-file component.
import App from './App.vue'

const config = {
  url: '<YOUR_API_URL>',
  clientKey: '<YOUR_API_TOKEN>',
  refreshInterval: 15,
  appName: 'unleash-onboarding-vue',
}

const app = createApp(App)
app.use(unleashPlugin, { config })
app.mount('#app')
```
