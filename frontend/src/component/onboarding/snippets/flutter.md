1\. Install the SDK
```sh
flutter pub add unleash_proxy_client_flutter
```

2\. Initialize Unleash
```dart
import 'package:unleash_proxy_client_flutter/unleash_proxy_client_flutter.dart';
import 'dart:async';

final unleash = UnleashClient(
    url: Uri.parse('<YOUR_API_URL>'),
    clientKey: '<YOUR_API_TOKEN>',
    appName: 'unleash-onboarding-flutter');

unleash.start();
```

3\. Check feature flag status
```dart
Timer.periodic(Duration(seconds: 1), (Timer timer) {
   final flagStatus = unleash.isEnabled('<YOUR_FLAG>');
   print('Flag is ${unleash.isEnabled("<YOUR_FLAG>") ? "enabled" : "disabled"}');
});
```
