1\. Install the SDK
```sh
pip install UnleashClient
```

2\. Run Unleash
```python
from UnleashClient import UnleashClient
import asyncio

client = UnleashClient(
    url="<YOUR_API_URL>",
    app_name="unleash-onboarding-python",
    refresh_interval=5,
    custom_headers={'Authorization': '<YOUR_API_TOKEN>'})

client.initialize_client()

while True:
    print(client.is_enabled("<YOUR_FLAG>"))
    asyncio.run(asyncio.sleep(1))
```
---
```python
from UnleashClient import UnleashClient
import asyncio
import os

client = UnleashClient(
    url="<YOUR_API_URL>",
    app_name="unleash-onboarding-python",
    custom_headers={'Authorization': os.getenv('UNLEASH_API_TOKEN')}
```

---
- [SDK repository with documentation](https://github.com/Unleash/unleash-client-python)
- [Python SDK example with CodeSandbox](https://github.com/Unleash/unleash-sdk-examples/tree/main/Python)
- [How to Implement Feature Flags in Python](https://docs.getunleash.io/feature-flag-tutorials/python)
