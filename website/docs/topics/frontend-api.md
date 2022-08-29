# Direct client-side API access

**This is a simplified workflow for connecting a client-side application ("frontend") to Unleash. It is a quick and easy way to add Unleash to SPAs and mobile apps.** This feature was also called _Embedded Proxy_, after it's roadmap item [#1875](https://github.com/Unleash/unleash/issues/1875).

:::info Check your version

This API is available since _Unleash **v4.16**_ (released in September 2022).

<!-- TODO: link blog post with release notes -->

:::

<!-- TODO: image illustrating connection -->

Let's go through the pros and cons of this approach.

- ✔️ It’s easy to create and manage API tokens<br/> This can be done from UI or with admin API, using tokens that have more access.
- ✔️ It doesn't require you to set up Unleash Proxy<br/> API interface is the same, and all existing “proxy-client” code and SDKs will work. Suffix _proxy-sdk_ for client-side SDKs is there because connecting with Unleash Proxy was the only way of using client-side API in previous versions.

* ⚠️ It can't handle large number of requests<br/> Direct access does not allow for horizontal scaling that Unleash Proxy does.
* ⚠️ It sends client details to Unleash instance<br/> Unleash doesn't save this to the database, only in short-term runtime cache, but for some use cases this can be a privacy issue.

This makes direct access best suitable for development purposes and applications that don’t receive a lot of traffic, for example internal dashboards. **This choice does not have to be final.** Since both options use the same SDKs, so you can always switch by changing just 2 lines in the configuration. We recommend you to start with direct client-side approach, and upgrade to Unleash Proxy as needed.

## Using client-sides SDKs

Before adding client-side integration to your application, consider if it is the best option. Maybe integration with the backend of your application will lead to a more smooth and consistent user experience? If on the other hand you expect the app to change immediately after the feature flag was enabled or modified, all and any Unleash [client-side SDKs](sdks#client-side-sdks) can work directly to your instance.

### API token

You can create appropriate token, with type `FRONTEND` on `<YOUR_UNLEASH_URL>/admin/api/create-token` page or with a request to `/api/admin/api-tokens`. See our guide on [how to create API tokens](/user_guide/api-token) for more details.

Client-side tokens have limited access to the API. This includes getting state of the feature toggles from provided context and sending metrics. This type of token is always scoped to one environment.

### ❕ Correct URL

API endpoint is different when using client-side SDK directly instead of pointing to Proxy. Set it to `https://<YOUR_UNLEASH_INSTANCE>/api/frontend`

### CORS configuration

For web and hybrid mobile applications it is necesary to whitelist domain for your applications. In Unleash UI go to `Admin/CORS` and add domains that host applications connecting with `FRONTEND` token. 

![CORS settings in Unleash UI](/img/admin_cors.png)

<br/>

## What's next?

With this configuration you should be able to quickly start developing your application with Unleash.
