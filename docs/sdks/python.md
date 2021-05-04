---
id: python_sdk
title: Python SDK
---

> **Required details**
>
> - **API URL** – Where you should connect your client SDK
> - **API Secret** – Your API secret required to connect to your instance.
>
> You can find this information in the “Admin” section Unleash management UI.

```python
from UnleashClient import UnleashClient

    client = UnleashClient(
        url="<API url>",
        app_name="my-python-app",
        custom_headers={'Authorization': '<Client secret>'})

    client.initialize_client()

    client.is_enabled("unleash.beta.variants")
```

Read more at [github.com/Unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)
