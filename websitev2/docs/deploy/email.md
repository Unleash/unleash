---
id: email
title: Email service
---

New since Unleash v4.0.0 is an email service allowing us to send reset password and welcome mails to new users. In order for this to work you'll need to tell unleash what SMTP service you'd like to send mails from.

If the service is not configured you'll see a log line every time you add a new user saying

```bash
[2021-05-07T12:59:04.572] [WARN] routes/user-controller.ts - email
was not sent to the user because email configuration is lacking
```

## Configuring {#configuring}

Depending on your deploy case there are different ways of configuring this service. Full documentation of all configuration possibilities is available [here](./configuring-unleash.md)

### Docker {#docker}

With docker, we configure the mail service via environment variables.

You'll want to at least include EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD and EMAIL_SENDER

Environment variables:

- EMAIL_HOST - Your SMTP server address
- EMAIL_PORT - Your SMTP server port - defaults to 567
- EMAIL_SECURE - whether to use SMTPS - set to `false` or `true` - defaults to false,
- EMAIL_USER - the username to authenticate against your SMTP server
- EMAIL_PASSWORD - the password for your SMTP user
- EMAIL_SENDER - which address should reset-password mails and welcome mails be sent from - defaults to `noreply@unleash-hosted.com` which is probably not what you want.

### Node {#node}

With node, we can configure this when calling Unleash's start method.

```js
const unleash = require('unleash-server');

unleash.start({
  email: {
    host: 'myhost',
    smtpuser: 'username',
    smtppass: 'password',
    sender: 'noreply@mycompany.com',
  },
});
```
