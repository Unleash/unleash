1\. Install the SDK
```gradle
implementation("io.getunleash:unleash-android:\${unleash.sdk.version}")

// Enable required permissions
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

2\. Initialize Unleash
```kotlin
val unleash = DefaultUnleash(
    androidContext = applicationContext, // Reference to your Android application context
    unleashConfig = UnleashConfig.newBuilder(appName = "unleash-onboarding-android")
        .proxyUrl("<YOUR_API_URL>")
        .clientKey("<YOUR_API_TOKEN>")
        .pollingStrategy.interval(3000)
        .metricsStrategy.interval(3000)
        .build()
)
```
