---
id: api-token
title: API Tokens
---

In order to connect to Unleash clients will need an API token to grant access. A client SDK will need to token with "client privileges", which allows them to fetch feature toggle configuration and post usage metics back.

## Create API Token {#create-api-token}

### Permissions {#permissions}

To create an API token you'll need the CREATE_API_TOKEN permission level, at the time of writing (v4.0.0), this level is only set for instance admins.

Eventually one should be able to customize which users has access to create tokens.

All users are able to see tokens with CLIENT level access, but only instance admins can see tokens with ADMIN level access.

### Step-by-step {#step-by-step}

**1. Select `Admin` from the sidebar**

![Admin menu](/img/admin_side_menu.png)

**2. Select `Api Access` from the tab menu**

![Tab Menu](/img/admin_tab_menu.png)

**3. Click `Add new API key` at the top right of the page**

**Client keys**

4a. If you're configuring an SDK select `Client` in the pop-up. And give the key an identifying name allowing you to recognize it later

![Api key client](/img/add_new_api_key.png)

5a. Copy the `Secret` column and add this to your client

![Api key list](/img/api_key_list.png)

**Admin operations**

4a. If you're going to be using the admin interface via CURL you'll need a key with `Admin` rights. Select `Admin` in the `Add new API key` popup.

Remember to give the key a username allowing you to recognize the key in audit logs later

5a. Copy the key in the `Secret` column and use it in your authorization header. For curl, that would be `-H "Authorization: <yoursecrethere>"`
