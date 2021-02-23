---
id: python_sdk
title: Python SDK
---

```java
from UnleashClient import UnleashClient
  
    client = UnleashClient(
        url="<API url>",
        app_name="my-python-app",
        custom_headers={'Authorization': '<Client secret>'})
    
    client.initialize_client()
  
    client.is_enabled("unleash.beta.variants")
```

Read more at [github.com/Unleash/unleash-client-python](https://github.com/Unleash/unleash-client-python)