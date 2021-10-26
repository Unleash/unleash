---
id: jira_plugin_installation
title: Jira Integration - Installation
---

> The Jira Plugin is part of Unleash Enterprise.

With the Unleash JIRA plugin you can create new feature toggles in Unleash from a JIRA issue. You'll also be able to link existing toggles to JIRA issues as well as see current status of the linked toggle as both a custom field and as an Issue Panel.

## Required access levels

### Unleash

You will need an Unleash Instance Admin to configure an admin API token.

### Jira

You will need a Jira user with access to install plugins.

## Installation

The Jira plugin is currently not listed on the Atlassian marketplace.

To get access to the Jira plugin, please reach out to sales@getunleash.io.

You will receive a dedicated link that will allow you to download and install the Unleash Jira plugin.

When following the link you'll be greeted by an installation screen similar to the one down below ![Jira plugin install](/img/jira_plugin_installation.png)

## Configuring plugin

Once installed you'll need to head to "Manage your apps"

![Jira - app menu bar location](/img/jira_apps_menu_bar.png) ![Jira - manage your apps link](/img/jira_manage_apps.png)

Once there you should see "Unleash Admin" in your sidebar.

Click it, and you'll get taken to our configuration page

![Jira - manage apps sidebar](/img/jira_manage_apps_sidebar.png)

Once on the configuration page. You should enter your installation URL and an API Key with access level `Admin`

- For your installation URL
  - if you're using Unleash Hosted in Europe, your URL will have the format `https://app.unleash-hosted.com/**[instanceName]**/api`
  - if you're using Unleash Hosted in US, your URL will have the format `https://us.unleash-hosted.com/**[instanceName]**/api`
  - if you're Self hosted, your URL will need to point to wherever your installation is located, suffixed with `/api`.
- See [the API token doc](/user_guide/api-token) for how to configure an Admin token
  > NB! Since the plugin is currently using an ADMIN level API token, it has full access to all projects and issues

![Jira - Configure unleash app](/img/jira_configure_unleash_app.png)

After you've entered the URL and API key and clicked `Submit` your api token will no longer be visible.

![Jira - API key already set](/img/jira_admin_api_key_set.png)

Now, you're ready to [use the plugin from Jira issues](/integrations/jira_plugin_usage)
