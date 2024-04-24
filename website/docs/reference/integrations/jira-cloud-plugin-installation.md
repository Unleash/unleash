---
title: Jira Cloud Integration - Installation
---
import Figure from '@site/src/components/Figure/Figure.tsx'

## Prerequisites

### Jira Cloud

- [Jira **Cloud**](https://www.atlassian.com/software/jira)

For Jira Data Center, check out the [Jira Server plugin](jira-server-plugin-installation.md)

### Unleash

- Unleash v4 or higher

## Required access levels

### Unleash

You will need an Unleash admin user to configure the access tokens needed to connect the plugin to Unleash.

This plugin requires an Unleash Pro or an Unleash Enterprise instance.

We recommend using a [service account](../service-accounts.md) token for communicating with Unleash. Service accounts are also required to integrate with [Change Requests](../change-requests.md)

### Jira

You will need a Jira admin user.

## Installation

Start by visiting the [Landing page for the Unleash Enterprise For Jira plugin on Atlassian marketplace](https://marketplace.atlassian.com/apps/1231447/unleash-enterprise-for-jira?hosting=cloud&tab=overview).

![Atlassian marketplace landing page for the Unleash Enterprise For Jira plugin.](/img/unleash-marketplace-for-unleash-enterprise-jira-plugin.png)

1. Click the yellow button in the top right corner labeled "Get it now"
2. Choose which site to install the app to.
3. Click the blue "Install app" button located at the bottom right.

## Configuring the plugin {#configure-plugin}

After the plugin has been installed, each project's settings page in Jira will have a menu entry link called "Unleash Project Settings" under the "Apps" menu section.

![Jira Cloud project settings page with the apps menu open. The link to Unleash project settings is highlighted.](/img/jira-cloud-project-settings-link.png)

Following that link takes you to the "Unleash Project Settings" configuration page. This is where you specify the connection details (Unleash server URL and access token) for the Unleash server to be used with this particular project.

![Jira Cloud: Unleash project settings. A form with inputs for Unleash URL and an Unleash auth token.](/img/jira-cloud-project-settings.png)

Once you have configured the connection for the Unleash server, your users should be ready to [use the Jira Cloud plugin](jira-cloud-plugin-usage)
