# Direct client-side API access

:::info Check your version
This API is available since _Unleash **v4.16**_ (released in September 2022).

<!-- TODO: link blog post with release notes -->

:::

This is a simplified workflow for connecting client-side application ("frontend") to Unleash. It is a quick and easy way to add Unleash to SPAs and mobile apps.

<!-- TODO: image illustrating connection -->

Let's go through the pros and cons of this approach.

- ✔️ It’s easy to create and manage API tokens<br/> This can be done from UI or with admin API, using tokens that have more access.
- ✔️ It doesn't require you to set up Unleash Proxy<br/> API interface is the same, and all existing “proxy-client” code and SDKs will work.

* ⚠️ It can't handle large number of requests<br/> Direct access does not allow for horizontal scaling that Unleash Proxy does.
* ⚠️ It sends client details to Unleash instance<br/> Unleash doesn't save this to the database, only in short-term runtime cache, but for some use cases this can be a privacy issue.

This makes direct access suitable for development purposes and applications that don’t receive a lot of traffic, for example internal dashboards.

## API token

You can create appropriate token, with type `FRONTEND` on `<YOUR_UNLEASH_URL>/admin/api/create-token` page or with a request to `/api/admin/api-tokens`. See our guide on [how to create API tokens](/user_guide/api-token) for more details.

Client-side tokens have limited access to the API. This includes getting state of the feature toggles from provided context and sending metrics. This type of token is always scoped to one environment.

## Using client-sides SDKs

TODO: explain differences between client-side and server-side integrations

TODO: emphasise correct URL config

## CORS configuration

FIXME: add details on config page (without explaining what CORS is, lol)

## Footnotes

This feature was also called _Embedded Proxy_, after it's roadmap item [#1875](https://github.com/Unleash/unleash/issues/1875).
