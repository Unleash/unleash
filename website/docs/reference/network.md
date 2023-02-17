---
title: Network view
---

:::info Availability

The Network view was released in Unleash 4.21. It is available to Pro and Enterprise users.

:::

The **Network** page presents 2 different views of how your applications are connected to Unleash. A simplified view of the connected instances, and a line graph showing the change over time of the different sources of traffic. 


This should help you understand if there is some misconfiguration in some of your applications or if there is a recent surge in traffic in some of them. 

## Network overview

Using this page you can see connected nodes at glance with their requests per second (req/s)

![Network overview showing 3 connected apps](/img/network-overview.png)

## Network traffic

Network traffic can help you identify misconfigured apps, surges in traffic or other anomalies.

![Network traffic showing 3 sources and unregistered apps as unknown](/img/network-traffic.png)

# Prerequisites
This features uses a Prometheus-like API to query data produced by Unleash server. Our managed instances receive this a part of our service.

It's most useful when having the toggle `responseTimeWithAppName` enabled (for hosted customers we enabled it for all customers), because it will allow you to identify the applications generating the traffic.
