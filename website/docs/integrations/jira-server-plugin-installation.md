---
id: jira_server_plugin_installation
title: Jira Server Integration - Installation
---

> The Jira Server Plugin is part of Unleash Enterprise.

With the Unleash Jira server plugin you can create new feature toggles in Unleash from a Jira issue as well as link
existing toggles to Jira issues.

The plugin also shows you current status of connected toggles.

## Prerequisites

### Jira

- [Jira **data center**](https://www.atlassian.com/enterprise/data-center/jira), v8.0 or higher

We do not support Jira Cloud at the moment.

### Unleash

- Unleash v4 or higher
- Unleash Pro or Unleash Enterprise license

## Required access levels

### Unleash

You will need an Unleash admin to configure an admin API token.

### Jira

You will need a Jira admin user.

## Installation

The [Jira server plugin is available in the Atlassian marketplace](https://marketplace.atlassian.com/apps/1227377/unleash-for-jira?tab=overview&hosting=datacenter).


## Configuring the plugin {#configure-plugin}

After the plugin is installed. Jira's Manage Apps page will have a new menu section called "Unleash Admin" with a single
link - "Configure servers".

![Jira Manage Apps - Unleash Admin](/img/jira_server_manage_unleash_admin.png)

Following the "Configure servers" link will take you to a config page where you can setup your connection(s) to Unleash
servers. The Unleash Jira server plugin supports having a global server configured for all Jira projects, or a specific
server configured for a specific Jira project.

![Jira Manage Apps - Unleash Server Admin](/img/jira_server_manage_servers.png)

Once you have configured at least one Unleash server, your users should be ready to [use the Jira Server plugin](/integrations/jira_server_plugin_usage)

### Edit existing servers

In the list of known servers, each server has a connected edit button. Clicking the edit button brings up the edit
dialog for the server, allowing you to change the details for the selected server

![Jira Manage Apps - Edit server](/img/jira_server_edit_server.png)


### Delete (disconnect) existing servers

Deleting a server from the admin interface does not actually delete the server, but it deletes Jira's knowledge of the
server.
Since this is a destructive operation, our plugin will ask for confirmation that you're sure you want to do this.

![Jira Manage apps - Delete server confirmation](/img/jira_server_delete_server_confirmation.png)

You will not be allowed to delete a server that has toggles connected to issues, instead you'll receive a
warning dialog telling you that you'll need to disconnect the toggles from their issues first.

![Jira Manage apps - Delete server connected toggles](/img/jira_server_delete_connected_toggles.png)
