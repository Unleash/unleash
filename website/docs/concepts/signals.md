---
title: Signals
---

import SearchPriority from '@site/src/components/SearchPriority';

<SearchPriority level="high" />

:::note Availability

**Plan**: [Enterprise](https://www.getunleash.io/pricing) | **Version**: `5.11+` in BETA

:::


## Overview

Signals represent that something happened somewhere. Signal endpoints allow external systems to let Unleash know about these signals via a simple HTTP API.

You can then configure [actions](/concepts/actions) to automatically react to the received signals.

![Signals from external systems.](/img/signals/signals-input.png)

Depending on your use case, you can create multiple signal endpoints, one per each external source, or re-use the same endpoint across different sources, using different API tokens for each, so the source can be identified.

## Creating signal endpoints

:::info Permissions

Creating signal endpoints requires the `ADMIN` permission.

:::

To create a new signal endpoint, navigate to the **Admin UI** and select **Integrations** from the configure menu.

![Integrations menu.](/img/signals/integrations.png)

In the integrations page, select the Signals integration:

![Integrations menu.](/img/signals/signals-option.png)

After accessing the Signals integration configuration, you can use the "New signal endpoint" button. This will open a form where you can configure your new signal endpoint.

![New signal form.](/img/signals/new-signal-form.png)

## Using a signal endpoint

Using a signal endpoint is as easy as sending a POST request to the signal endpoint URL with the correct API token. The body payload is optional, but if present should be formatted as JSON.

```shell
curl -X POST https://unleash.example.com/api/signal-endpoint/my-signal-endpoint \
  -H "Authorization: Bearer your_token_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "my-signal",
    "data": {
      "key": "value"
    }
  }'
```

Configuring an external system to use your new signal endpoint should be straightforward as there's no requirement on the payload structure. The key aspects to take into consideration is making sure the URL is correct and that the token is sent in the `Authorization` header.

## View signals as they arrive

To view the signals as they arrive, navigate to the **Signals** page in the **Admin UI** and select the **View signals** option in the respective signal endpoint row.

![View signals option.](/img/signals/view-signals-option.png)

This can help you test that the integration is working before you send in the real signals, or diagnose any unexpected behavior.


## Limits that apply
There are some constraints on the signal endpoints API as a measure to protect the stability of Unleash. These values can be overridden for self-hosted installations.

- **Rate limit**: 1 request per second.
- **Max endpoints**: 5.
- **Max tokens per endpoint**: 5.
- **Payload size**: 100kb (Express default).

Ref: [Unleash Config](https://github.com/Unleash/unleash/blob/859fe098fedc261d646833012d9d408039491075/src/lib/create-config.ts#L577-L604)

## Reacting to signals
See [Actions](/concepts/actions)
