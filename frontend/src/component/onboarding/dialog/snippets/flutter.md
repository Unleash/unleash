1\. Install the SDK
```sh
flutter pub add unleash_proxy_client_flutter
```

2\. Run Unleash
```dart
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';
import 'dart:async';

final unleash = UnleashClient(
    url: Uri.parse('<YOUR_API_URL>'),
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-flutter');

unleash.start();

Timer.periodic(Duration(seconds: 1), (Timer timer) {
   final flagStatus = unleash.isEnabled('<YOUR_FLAG>');
   print('Flag is ${unleash.isEnabled("<YOUR_FLAG>") ? "enabled" : "disabled"}');
});
```
---
```dart
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';
import 'dart:async';
import 'dart:io';

final unleash = UnleashClient(
    url: Uri.parse('<YOUR_API_URL>'),
    clientKey: Platform.environment['UNLEASH_CLIENT_KEY']!,
    appName: 'unleash-onboarding-flutter');

unleash.start();
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash_proxy_client_flutter)
- [Flutter example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Flutter)
- [A/B Testing in Flutter using Unleash and Mixpanel](https://docs.getunleash.io/feature-flag-tutorials/flutter/a-b-testing)
