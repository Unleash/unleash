---
id: jira_server_plugin_installation
title: Jira Server Integration - Installation
---

> The Jira Server Plugin is part of Unleash Enterprise.

With the Unleash Jira server plugin you can create new feature toggles in Unleash from a Jira issue as well as link
existing toggles to Jira issues.

The plugin also shows you current status of connected toggles.

## Required access levels

### Unleash

You will need an Unleash Instance admin to configure an admin API token.

### Jira

You will need a Jira admin user.

## Installation

The Jira server plugin is currently not listed on the Atlassian marketplace.

To get access to the Jira plugin, please reach out to sales@getunleash.io.

You will receive a dedicated link that will allow you to download the Unleash Jira server plugin.

Once you've downloaded the plugin artifact, you'll need to click the Manage Apps link in Jira's administration menu

![Jira Manage Apps](/img/jira_server_manage_apps.png)

This will take you to Atlassian's marketplace for Jira apps.

From here, click the "Manage apps" link in the left-hand menu

![Jira Marketplace - Manage apps](/img/jira_marketplace_manage_apps.png)

Now, click "Upload app"

![Jira Manage Apps - Upload App](/img/jira_upload_app.png)

This will prompt you to select the plugin artifact for upload.

![Jira Manage Apps - Browse](/img/jira_upload_app_dialog.png)

Once you've selected your file and clicked "Upload". Jira will install the plugin, and you can move on
to [Configuring the plugin](#configure-plugin)

## Configuring plugin {#configure-plugin}

After the plugin is installed. Jira's Manage Apps page will have a new menu section called "Unleash Admin" with a single
link - "Configure servers".

![Jira Manage Apps - Unleash Admin](/img/jira_server_manage_unleash_admin.png)

Following the "Configure servers" link will take you to a config page where you can setup your connection(s) to Unleash
servers. The Unleash Jira server plugin supports having a global server configured for all Jira projects, or a specific
server configured for a specific Jira project.

![Jira Manage Apps - Unleash Server Admin](/img/jira_server_manage_servers.png)

Once you have configured at least one Unleash server, your users should be ready to [Use the Jira Server plugin](/integrations/jira_server_plugin_usage)

### Edit existing servers

In the list of known servers, each server has a connected edit button. Clicking the Edit button brings up the edit
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
