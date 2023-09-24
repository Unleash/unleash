---
title: How to create and assign custom root roles
---

:::info availability

Custom root roles were introduced in **Unleash 5.4** and are only available in Unleash Enterprise.

:::


This guide takes you through [how to create](#creating-custom-root-roles "how to create custom root roles") and [assign](#assigning-custom-root-roles "how to assign custom root roles") [custom root roles](../reference/rbac.md#custom-root-roles). Custom root roles allow you to fine-tune access rights and permissions to root resources in your Unleash instance.

## Creating custom root roles

### Step 1: Navigate to the custom root roles page {#create-step-1}

Navigate to the _roles_ page in the admin UI (available at the URL `/admin/roles`). Use the _settings_ button in the navigation menu and select "roles".

![The admin UI admin menu with the Roles item highlighted.](/img/create-crr-step-1.png)

### Step 2: Click the "new root role" button. {#create-step-2}

Use the "new root role" button to open the "new root role" form.

![The "root roles" table with the "new root role" button highlighted.](/img/create-crr-step-2.png)

### Step 3: Fill in the root role form {#create-step-3}

Give the root role a name, a description, and the set of permissions you'd like it to have. For a full overview of all the options, consult the [custom root roles reference documentation](../reference/rbac.md#custom-root-roles).
    
![The root role form filled with some example data, and the "add role" button highlighted at the bottom.](/img/create-crr-step-3.png)

## Assigning custom root roles

You can assign custom root roles just like you would assign any other [predefined root role](../reference/rbac.md#predefined-roles). Root roles can be assigned to users, [service accounts](../reference/service-accounts.md), and [groups](../reference/rbac.md#user-groups).
