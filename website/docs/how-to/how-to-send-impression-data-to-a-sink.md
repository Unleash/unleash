---
title: How to send impression data to a sink
---

Unleash allows you to gather [**impression data**](../advanced/impression-data.md) from your feature toggles, giving you complete visibility into who checked what toggles and when. What you do with this data is entirely up to you, but a common use case is to send it off to an aggregation and analytics service such as [Google Analytics](analytics.google.com/) or [Posthog](https://posthog.com/).

This guide will take you through everything you need to do in Unleash to facilitate such a workflow. It will show you how to send data to Google Analytics (and Posthog?) as an example sink, but the exact same principles will apply to any other service of the same kind.

## Prerequisites

We will assume that you have the necessary details for your third-party service:

- **where to send the data to**. We'll refer to this in the code samples below as **`<sink-url>`**.
- **what format the data needs to be in**. This will determine how you transform the event data before you send it.

In addition you'll need to have a toggle to record impression data for and an [Unleash client SDK](../sdks/index.md) that supports impression data. This guide will use the [JavaScript proxy SDK](../sdks/proxy-javascript.md).

When you have those things sorted, follow the below steps.

## Enable impression data for your feature toggle {#step-1}

This is in the admin UI ... you do this by

### Enabling impression data for new toggles

### Enabling impression data for existing toggles

## Capture impression events in your client {#step-2}


## Transform the data {#step-3}

## Send the event data to your sink {#step-4}
