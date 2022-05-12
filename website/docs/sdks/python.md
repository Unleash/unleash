---
id: python_sdk
title: Python SDK
---

> You will need your `API URL` and your `API token` in order to connect the Client SDK to you Unleash instance. You can find this information in the “Admin” section Unleash management UI. [Read more](../user_guide/api-token)

```python
from UnleashClient import UnleashClient

    client = UnleashClient(
        url="<API url>",
        app_name="my-python-app",
        custom_headers={'Authorization': '<API token>'})

    client.initialize_client()

    client.is_enabled("unleash.beta.variants")
```

## Checking if a feature is enabled {#checking-if-a-feature-is-enabled}

A check of a simple toggle:

```python
client.is_enabled("My Toggle")
```

Specifying a default value:

```python
client.is_enabled("My Toggle", default_value=True)
```

Supplying application context:

```python
app_context = {"userId": "test@email.com"}
client.is_enabled("User ID Toggle", app_context)
```

Supplying a fallback function:

```python
def custom_fallback(feature_name: str, context: dict) -> bool:
    return True

client.is_enabled("My Toggle", fallback_function=custom_fallback)
```

- Must accept the feature name and context as an argument.
- Client will evaluate the fallback function only if exception occurs when calling the `is_enabled()` method i.e. feature flag not found or other general exception.
- If both a `default_value` and `fallback_function` are supplied, client will define the default value by `OR`ing the default value and the output of the fallback function.

## Getting a variant {#getting-a-variant}

Checking for a variant:

```python
context = {'userId': '2'}  # Context must have userId, sessionId, or remoteAddr.  If none are present, distribution will be random.

variant = client.get_variant("MyvariantToggle", context)

print(variant)
> {
>    "name": "variant1",
>    "payload": {
>        "type": "string",
>        "value": "val1"
>        },
>    "enabled": True
> }
```

Read more at [github.com/Unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)
