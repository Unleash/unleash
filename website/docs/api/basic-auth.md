---
id: basic-auth
title: Basic Auth
---

# Basic auth

When using the `insecure` authentication method, identifying using basic auth against the API is enough. Since the `insecure` method doesn't require a password, it is enough to define the username when making HTTP requests.

### With curl {#with-curl}

Add the `-u myemail@test.com` flag to your curl command.

### With wget {#with-wget}

Add the `--user=myemail@test.com` flag to your wget command.
