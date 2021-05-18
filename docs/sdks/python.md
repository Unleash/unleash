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

Read more at [github.com/Unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)
