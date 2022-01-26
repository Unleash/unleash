---
id: php_sdk
title: PHP SDK
---

In this guide we explain how to use feature toggles in a PHP application using Unleash-hosted. We will be using the open source Unleash [PHP Client SDK](https://github.com/Unleash/unleash-client-php).

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

## Step 1: Install the client SDK {#step-1-install-the-client-sdk}

First we must add Unleash Client SDK as a dependency to your project. Below is an example of how to install it via composer:

```shell
composer require unleash/client guzzlehttp/guzzle symfony/cache
```

> Note: You can install any other PSR-16, PSR-17 and PSR-18 implementations instead of guzzlehttp/guzzle and symfony/cache

## Step 2: Create a new Unleash Instance {#step-2-create-a-new-unleash-instance}

Next we must initialize a new instance of the Unleash Client.

```php
<?php

use Unleash\Client\UnleashBuilder;

$unleash = UnleashBuilder::create()
    ->withAppName('my.php-app')
    ->withInstanceId('your-instance-1')
    ->withAppUrl('API URL')
    ->withHeader('Authorization', 'API token')
    ->build();
```

In your app you typically just want one instance of Unleash, and inject that where you need it. You will typically use a dependency injection frameworks to manage this.

You should change the URL and the Authorization header (API token) with the correct values for your instance, which you may locate under “Instance admin” in the menu.

## Step 3: Use the feature toggle {#step-3-use-the-feature-toggle}

Now that we have initialized the client SDK we can start using feature toggles defined in Unleash in our application. To achieve this we have the “isEnabled” method available, which will allow us to check the value of a feature toggle. This method will return **true** or **false** based on whether the feature should be enabled or disabled for the current request.

```php
<?php

if ($unleash->isEnabled("AwesomeFeature")) {
  //do some magic
} else {
  //do old boring stuff
}
```

Read more about the [Unleash architecture](https://www.unleash-hosted.com/articles/our-unique-architecture) to learn how it works in more details

## Step 4: Provide Unleash Context {#step-4-provide-unleash-context}

It is the client SDK that computes whether a feature toggle should be considered enabled or disabled for specific use request. This is the job of the [activation strategies](../user_guide/activation-strategies.md), which are implemented in the client SDK.

The activation strategies is an implementation of rules based on data, which you provide as part of the Unleash Context.

**a) As argument to the isEnabled call**

The simplest way to provide the Unleash Context is as part of the “isEnabled” call:

```php
<?php

use Unleash\Client\Configuration\UnleashContext;

$context = new UnleashContext(
    currentUserId: 'user@mail.com',
);

$unleash->isEnabled("someToggle", $context);
```


**b) Via a UnleashContextProvider**

This is a bit more advanced approach, where you configure a unleash-context provider. By doing this you do not have to rebuild or to pass the unleash-context object to every place you are calling `$unleash->isEnabled()`.

```php
<?php

use Unleash\Client\UnleashBuilder;

$contextProvider = new MyAwesomeContextProvider();
$unleash = UnleashBuilder::create()
    ->withAppName('my.php-app')
    ->withInstanceId('your-instance-1')
    ->withAppUrl('http://unleash.herokuapp.com/api/')
    ->withContextProvider($contextProvider)
    ->build();

// Anywhere in the code unleash will get the unleash context from your registered provider.
$unleash->isEnabled("someToggle");
```

> You can read more complete documentation in the [Client SDK repository](https://github.com/Unleash/unleash-client-php).
