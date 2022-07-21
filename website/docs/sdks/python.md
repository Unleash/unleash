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

Check a feature's status:

```Python title="Check whether a feature is enabled"
client.is_enabled("my_toggle")
```

To supply application context, use the second positional argument:

```Python title="Check whether a feature is enabled for the given context"
app_context = {"userId": "test@email.com"}
client.is_enabled("user_id_toggle", app_context)
```

### Fallback function and default values

You can specify a fallback function for cases where the client doesn't recognize the toggle by using the `fallback_function` keyword argument:

```Python title="Check a feature status, using a fallback if the feature is unrecognized."
def custom_fallback(feature_name: str, context: dict) -> bool:
    return True

client.is_enabled("my_toggle", fallback_function=custom_fallback)
```

You can also use the `fallback_function` argument to replace the obsolete `default_value` keyword argument by using a lambda that ignores its inputs. Whatever the lambda returns will be used as the default value.

```Python title="Use fallback_function to provide a default value"
client.is_enabled("my_toggle", fallback_function=lambda feature_name, context: True)
```

The fallback function **must** accept the feature name and context as positional arguments in that order.

The client will evaluate the fallback function only if an exception occurs when calling the `is_enabled()` method. This happens when the client can't find the feature flag. The client _may_ also throw other, general exceptions.

## Getting a variant {#getting-a-variant}

Checking for a variant:

```python
context = {'userId': '2'}  # Context must have userId, sessionId, or remoteAddr.  If none are present, distribution will be random.

variant = client.get_variant("my_variant_toggle", context)

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
