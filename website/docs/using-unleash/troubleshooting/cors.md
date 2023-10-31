---
title: My requests are being blocked by CORS
---

1. Make sure you've configured CORS access in Unleash admin UI settings as defined in the [Unleash CORS Policy docs](/reference/front-end-api#cors). These settings can be changed in the Unleash Dashboard under **Settings -> CORS Origins** or by using the [API](/reference/api/unleash/set-ui-config). Allowing all origins (using a single asterisk) will address this matter and is a great starting point when troubleshooting the behavior.
1. When receiving "**No 'Access-Control-Policy' header is present on the requested resource**", using the command `curl -I https://<host>/<endpoint>` will allow us to verify that the response includes the header `Access-Control-Allow-Origin: *`.