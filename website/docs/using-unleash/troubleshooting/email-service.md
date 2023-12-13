---
title: The email service is not working correctly on my self-hosted Unleash instance
---

When setting up your self-hosted Unleash instance, one of the available options is to configure an [email service](https://docs.getunleash.io/using-unleash/deploy/email-service) that will allow Unleash to send reset password and welcome emails to users.

Here's how to troubleshoot some common issues related to the email service.

## Configuration

The most common issues arise from misconfiguration. Please refer to the following documentation for guidance:
- [Email service](https://docs.getunleash.io/using-unleash/deploy/email-service)
- [Configuring Unleash](https://docs.getunleash.io/using-unleash/deploy/configuring-unleash)

You should double check that the details in your configuration look correct.

## Invalid URL error

Make sure that the [UNLEASH_URL](https://docs.getunleash.io/using-unleash/deploy/configuring-unleash#unleash-url) variable is correctly set to a valid URL. This should be set to the public discoverable URL of your Unleash instance, and it should include the protocol (http or https).

Examples:
- Subdomain: `https://unleash.mysite.com`
- Subpath: `https://mysite.com/unleash`

## SSL-related errors

### SMTP TLS port

Please double check that you're trying to reach your SMTP server on the TLS port, typically `587`.

### Custom SSL certificate

If you're using your own SMTP server which uses a custom SSL certificate, you will need to tell Unleash to trust that certificate. You can do this by setting the [NODE_EXTRA_CA_CERTS](https://docs.getunleash.io/using-unleash/deploy/configuring-unleash#node-extra-ca-certs) variable to the path of the certificate file.

This is usually done by mounting the custom certificate in a volume, and then setting `NODE_EXTRA_CA_CERTS` to the absolute path in the container where it can find the certificate. For example, if you mount it to `/var/certs`, you should set `NODE_EXTRA_CA_CERTS` to something like `/var/certs/mycert.crt`.
