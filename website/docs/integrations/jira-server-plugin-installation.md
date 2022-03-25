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

## Required access levels

### Unleash

You will need an Unleash admin to configure an admin API token.

### Jira

You will need a Jira admin user.

## Installation

The [Jira server plugin is available in the Atlassian marketplace](https://marketplace.atlassian.com/apps/1227377/unleash-for-jira?tab=overview&hosting=datacenter).

You'll need to download the plugin and create a license key.

If you have an Unleash enterprise license you're welcome to reach out to us at sales@getunleash.io for a free plugin license, otherwise you'll need to try the plugin for 30 days free or purchase a license through the marketplace.

Once you've downloaded the plugin artifact, you'll need to follow the Manage apps link in Jira's administration menu.

On the Manage apps page, use the "upload app" button.

![The Jira "manage apps" page. The "upload app" button is visually highlighted.](/img/jira_upload_app.png)

This will prompt you to select the plugin file you downloaded in the previous steps for upload.

Once you've selected your file and started the upload, Jira will install the plugin. If the installation is successful, you'll get a status screen saying that it successfully installed.

![The successful install screen mentioned in the preceding paragraph.](/img/jira_server_installed_ready_to_go.png)

## Configuring the plugin {#configure-plugin}

After the plugin is installed. Jira's Manage Apps page will have a new menu section called "Unleash Admin" with a single
link - "Configure servers".

![The "configure servers" link highlighted in the Manage Apps menu.](/img/jira_server_manage_unleash_admin.png)

Following the "Configure servers" link will take you to a config page where you can setup your connection(s) to Unleash
servers. The Unleash Jira server plugin supports having a global server configured for all Jira projects, or a specific
server configured for a specific Jira project.

![A table marked Unleash Server Configuration, listing Unleash server instances.](/img/jira_server_manage_servers.png)

Once you have configured at least one Unleash server, your users should be ready to [use the Jira Server plugin](/integrations/jira_server_plugin_usage)

### Edit existing servers

In the list of known servers, each server has a connected edit button. Clicking the edit button brings up the edit
dialog for the server, allowing you to change the details for the selected server

![An "editing server" form. The fields are "JIRA project", "Name", "Api URL", "Api Key"](/img/jira_server_edit_server.png)


### Delete (disconnect) existing servers

Deleting a server from the admin interface does not actually delete the server, but it deletes Jira's knowledge of the
server.
Since this is a destructive operation, our plugin will ask for confirmation that you're sure you want to do this.

![A plugin deletion confirmation dialog. It gives you two options: "Delete connection", and "Cancel".](/img/jira_server_delete_server_confirmation.png)

You cannot delete a server that has toggles connected to issues. Instead, you'll get a
warning dialog telling you that you'll need to disconnect the toggles from their issues first.

![A warning dialog telling you that you can't delete a server.](/img/jira_server_delete_connected_toggles.png)
