---
id: jira-comment
title: Unleash Jira commenter addon
---

> This feature was introduced in _Unleash v3.11.0_.

Enables commenting on issues from unleash when toggles are updated/revived/archived/created.

## Configuration

- When configuring an instance of the Jira commenter plugin you'll need the following

  - JIRA base url - e.g. https://mycompany.atlassian.net.
  - JIRA username - the username of the user the plugin should comment as.
  - JIRA api token - an api token for the user the plugin should comment as.
    - If you're running Atlassian cloud - it can be added by visiting: https://id.atlassian.com/manage-profile/security/api-tokens when logged in as the user the plugin should comment as.

- After the instance is configured, you can now tag your feature toggles with tags of type `jira`.
- The value of the tag should be in normal JIRA issue format (PROJECTKEY-ISSUENUMBER).
- Once a toggle has been tagged with a jira tag, all updates to the toggle will be added as a comment on the issue stored in the tag.
