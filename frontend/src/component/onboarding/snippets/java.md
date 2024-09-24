1\. Install the SDK
```xml
<dependency>
    <groupId>io.getunleash</groupId>
    <artifactId>unleash-client-java</artifactId>
    <version>Latest version here</version>
</dependency>
```

2\. Initialize Unleash
```java
UnleashConfig config = UnleashConfig.builder()
    .appName("unleash-onboarding-java")
    .instanceId("unleash-onboarding-instance")
    .unleashAPI("<YOUR_API_URL>")
    .apiKey("<YOUR_API_TOKEN>")
    .build();

Unleash unleash = new DefaultUnleash(config);
```
