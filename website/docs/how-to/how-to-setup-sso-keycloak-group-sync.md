---
title: 'How to set up Keycloak and Unleash to sync user groups'
---

:::info availability

User group syncing was released in Unleash 4.18 and is available to enterprise customers.

:::

In this guide, we will setup OIDC Single Sign-On (SSO) in Keycloak and configure Unleash to automatically sync user group membership from Keycloak.

## Prerequisites
The steps in this guide assume you have admin access to a running Unleash instance and to a running Keycloak instance.

## Keycloak Configuration

### Step 1: Navigate to Create Client {#keycloak-step-1}

Open the Keycloak admin dashboard, navigate to clients and select "Create Client".

![The Keycloak Admin UI with the steps highlighted to navigate to client configuration.](/img/setup-keycloak-sync-1.png)


### Step 2: Create an Unleash Client {#keycloak-step-2}

Select "OpenID Connect" as the client type and give your client a name, then save your configuration.

![The Keycloak Admin UI with the client configuration open.](/img/setup-keycloak-sync-2.png)

### Step 3: Set a redirect URI {#keycloak-step-3}

Set the redirect URI to:

`<base-url>/auth/oidc/callback`

For a hosted Unleash instance this becomes:

`https://<region>.app.unleash-hosted.com/<instance-name>/auth/oidc/callback`

Save your configuration.

![The Keycloak client configuration with redirect URIs highlighted.](/img/setup-keycloak-sync-3.png)

### Step 4: Copy your client secret {#keycloak-step-4}

Navigate to "Credentials" and copy your client secret. You'll need to add this to the Unleash configuration later, so put it somewhere you'll be able to find it.

![The Keycloak credentials configuration with copy client secret highlighted.](/img/setup-keycloak-sync-4.png)

### Step 5: Copy your OpenID endpoint configuration {#keycloak-step-5}

Navigate to your realm settings and copy the link to OpenID endpoint configuration. You'll need to add this to the Unleash configuration later.

![The Keycloak realm settings the OpenID endpoint configuration link highlighted.](/img/setup-keycloak-sync-5.png)

### Step 6: Create a new Client Scope and Map Groups {#keycloak-step-6}

Navigate to the "Client Scopes" page and select "Create Client Scope".

![The Keycloak Client Scopes page with the Create Client Scope button highlighted.](/img/setup-keycloak-sync-6.png)

Give your new scope a name. Set the type to "Optional". Make sure the protocol is set to "OpenID Connect" and the "Include in Token Response" option is enabled. Save your new scope.

![The Keycloak Add Client Scope page with the Name, Type, Protocol and Include in Token Response fields highlighted.](/img/setup-keycloak-sync-7.png)

Navigate to the Mappers tab and select "Configure new Mapper".

![The Keycloak Client Scope details page with the Mappers tab and Configure new Mapper element highlighted.](/img/setup-keycloak-sync-8.png)

Select the Group Membership mapper.

![The Keycloak mapper popup with the Group Membership mapper highlighted.](/img/setup-keycloak-sync-9.png)

Give your mapper a claim name, this must match the "Group Field JSON Path" in Unleash, and turn off the "Full group path" option.

![The Keycloak mapper options screen with the Token Claim Name and Full Group Path elements highlighted.](/img/setup-keycloak-sync-10.png)


## Unleash Configuration

### Step 1: Navigate to the Unleash SSO Configuration {#unleash-step-1}

Log in to Unleash as an admin user and navigate to the SSO configuration. Input your Client Secret (copied in step 3 of the Keycloak configuration), your Discover URL (copied in step 4  of the Keycloak configuration), and the Client ID (from step 2 of the Keycloak configuration).

![The Unleash SSO configuration screen with Client ID, Client Secret and Discover URL highlighted.](/img/setup-keycloak-sync-11.png)

### Step 2: Enable Group Syncing {#unleash-step-2}

Turn on Group Syncing and set a value for "Group Field JSON Path". This must match the value in claim name in Keycloak exactly. Save your configuration.

![The Unleash SSO configuration screen with the Enable Group Syncing and Group Field JSON Path highlighted.](/img/setup-keycloak-sync-12.png)

### Step 3: Enable Group Syncing for your Group {#unleash-step-3}

Navigate to Groups and select the group that you want to sync.

![The Groups page with a group element highlighted.](/img/setup-keycloak-sync-13.png)

Edit the group.

![The Group page with the Edit group element highlighted.](/img/setup-keycloak-sync-14.png)

Add as many SSO groups as you like. These need to match the Keycloak groups exactly.

![The edit group page with the add SSO group element highlighted.](/img/setup-keycloak-sync-15.png)

Save your configuration. Once a user belonging to one of these Keycloak groups logs in through SSO, they'll be automatically added to this Unleash group.
