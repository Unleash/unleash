---
title: Jira Cloud Integration - Installation
---

> The Jira Cloud Plugin is part of Unleash Enterprise.

With the Unleash Jira Cloud Plugin you can create new feature toggles in Unleash from a Jira issue as well as link
existing toggles to Jira issues.

The plugin also shows you current status of connected toggles.

## Prerequisites

### Jira Cloud

- [Jira **Cloud**](https://www.atlassian.com/software/jira)

For Jira Data Center, [see the Jira Server plugin](/integrations/jira_server_plugin_installation)

### Unleash

- Unleash v4 or higher

## Required access levels

### Unleash

You will need an Unleash admin to configure an admin API token. (Unleash Open Source)

For Unleash Enterprise we recommend [Service Tokens](https://docs.getunleash.io/how-to/how-to-create-service-accounts), this is also a requirement for integrating with Change Requests

### Jira

You will need a Jira admin user.

## Installation

The [Jira server plugin is available in the Atlassian marketplace](https://unleash-david.atlassian.net/jira/marketplace/discover/app/unleash-for-jira-cloud).

If you have an Unleash enterprise license you're welcome to reach out to us at sales@getunleash.io for a free plugin license, otherwise you'll need to try the plugin for 30 days free or purchase a license through the marketplace.

> More to be added here after we can have screenshots and guides of the installation procedure

## Configuring the plugin {#configure-plugin}

After the plugin has been installed, each project's settings page in Jira will have a menu entry link called "Unleash Project Settings" under the "Apps" menu section.

![Jira Cloud - Project settings link](/img/jira_cloud_project_settings_link.png)

Following that link takes you to the "Unleash Project Settings" configuration page. This is where you specify the connection details (Unleash server URL and access token) for the Unleash server to be used with this particular project.

![Jira Cloud - Project settings](/img/jira_cloud_project_settings.png)

Once you have configured the connection for the Unleash server, your users should be ready to [use the Jira Cloud plugin](/integrations/jira_cloud_plugin_usage)
