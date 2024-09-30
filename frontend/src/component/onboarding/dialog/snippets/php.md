1\. Install the SDK
```sh
composer require unleash/client
```

2\. Initialize Unleash
```php
<?php

use Unleash\\Client\\UnleashBuilder;

require 'vendor/autoload.php';

$unleash = UnleashBuilder::create()
    ->withAppName('unleash-onboarding-php')
    ->withAppUrl('<YOUR_API_URL>')
    ->withHeader('Authorization', '<YOUR_API_TOKEN>')
    ->withInstanceId('unleash-onboarding-instance')
    ->withMetricsInterval(5000)
    ->build();

while (true) {
    echo 'Feature flag is:  ' . $unleash->isEnabled('<YOUR_FLAG>') . PHP_EOL;
    sleep(1);
}
```
---
```php
$unleash = UnleashBuilder::create()
    ->withAppName('unleash-onboarding-php')
    ->withAppUrl('<YOUR_API_URL>')
    ->withHeader('Authorization', getenv('UNLEASH_API_TOKEN'))
    ->withInstanceId('unleash-onboarding-instance')
    ->build();
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-php)
- [PHP SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/PHP)
