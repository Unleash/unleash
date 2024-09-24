1\. Install the SDK
```xml
<dependency>
    <groupId>io.getunleash</groupId>
    <artifactId>unleash-client-java</artifactId>
    <version>LATEST</version>
</dependency>
```

2\. Initialize Unleash
```java
UnleashConfig config = UnleashConfig.builder()
    .appName("unleash-onboarding-java")
    .instanceId("unleash-onboarding-instance")
    .unleashAPI("<YOUR_API_URL>")
    .apiKey("<YOUR_API_TOKEN>")
    .sendMetricsInterval(5)
    .build();

Unleash unleash = new DefaultUnleash(config);
```

3\. Check feature flag status
```java
while (true) {
    boolean featureEnabled = unleash.isEnabled("<YOUR_FLAG>");
    System.out.println("Feature enabled: " + featureEnabled);
    Thread.sleep(1000);
}
```
