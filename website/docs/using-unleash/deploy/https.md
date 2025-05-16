---
title: Configuring Unleash to run over HTTPS
---

Preferred methods for setting up HTTPS in self-hosted instances, from highly recommended to those requiring more caution:

## Load Balancer

The best choice is to use a load balancer. 
A load balancer from a cloud provider renews the HTTPS certificates for you and keeps the data safe when it moves between the internet and your server.
Also, your cloud provider's private network between your load balancer and the application is already encrypted.

## Sidecar

If you're using something like Kubernetes and need HTTPS to be handled right next to your Unleash app, use a sidecar pattern. 
This method keeps the HTTPS handling separate from the Unleash application logic.
Tools like [Istio](https://istio.io/), [Envoy](https://www.envoyproxy.io/), [HAProxy](https://www.haproxy.org/), or [Nginx](https://www.nginx.com/) can help by automatically updating certificates.

## Manual SSL termination in Unleash

Approach manual SSL termination within Unleash with caution. 
This direct control method over the SSL setup adds complexity and a maintenance burden that can be challenging to manage.

If you insist on having Unleash do HTTPS termination for you, you'll need to set that up yourself using:
* http://expressjs.com/en/5x/api.html#app.listen
* https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener

Example:
```javascript
const https = require('node:https');
const fs = require('node:fs');
const options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};

let app = unleash.create();
https.createServer(options, app).listen(443);
```


