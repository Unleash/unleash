---
title: Login history
---

:::info

Login history is an enterprise feature available from Unleash 4.22 onwards.

:::

Unleash's login history lets you track login events in your Unleash instance, and whether the attempts were successful in logging in or not. 

![Login history table](/img/login-history-table.png)

For each login event, it lists:

 - **Created**: When it happened
 - **Username**: The username that was used
 - **Authentication**: The authentication type that was used
 - **IP address**: The IP address that made the attempt
 - **Success**: Whether the attempt was successful or not
 - **Failure reason**: If the attempt was not successful, the reason why

You can see the failure reason by hovering over the "False" badge in the "Success" column.

![Login history table failure reason](/img/login-history-table-fail.png)

Use the login history to:

- Audit login events in your Unleash instance
- Identify failed login attempts and investigate the cause
- Debug misconfigured authentication providers

The login history is mutable: You can remove individual login events or clear the entire history by deleting all of them.

Finally, the login history can be downloaded ([how do I download my Unleash login history](../how-to/how-to-download-login-history.mdx)) for external backups, audits, and the like.

## Retention

Events in the login history are retained for 336 hours (14 days).

Events older than the retention period are automatically deleted, and you won't be able to recover them. If you would like to collect login event information past the retention period, we suggest periodically downloading the login history.
