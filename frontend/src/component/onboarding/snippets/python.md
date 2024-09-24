1\. Install the SDK
```sh
pip install UnleashClient
```

2\. Initialize Unleash
```python
from UnleashClient import UnleashClient
import asyncio

client = UnleashClient(
    url="<YOUR_API_URL>",
    app_name="unleash-onboarding-python",
    refresh_interval=5,
    custom_headers={'Authorization': '<YOUR_API_TOKEN>'})

client.initialize_client()
```

3\. Check feature flag status
```python
while True:
    print(client.is_enabled("<YOUR_FLAG>"))
    asyncio.run(asyncio.sleep(1))
```
