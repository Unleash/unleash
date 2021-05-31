---
id: tags
title: Tagging Features
---

> This feature was introduced in Unleash 3.11.0

Do you want to filter your features to avoid having to see all features belonging to other teams than your own? Do you want to write a plugin that only gets notified about changes to features that your plugin knows how to handle?

### Say hello to Typed tags {#say-hello-to-typed-tags}

Unleash supports tagging features with an arbitrary number of tags. This eases filtering the list of tags to only those features that are tagged with the tag you're interested in.

#### How does it work? {#how-does-it-work}

Unleash will allow users to tag any feature with any number of tags. When viewing a feature, the UI will/may display all tags connected to that feature.

When adding a new tag, a dropdown will show you which type of tag you're about to add. Our first type; `simple` are meant to be used for filtering features. Show only features that have a tag of `MyTeam`.

#### Tag types {#tag-types}

Types can be anything, and their purpose is to add some semantics to the tag itself.

Some tag types will be defined by plugins (e.g. the slack plugin can define the Slack-type, to make it easy to specify which Slack channels to post updates for a specific feature toggle to).

Other tags can be defined by the user to give semantic logic to the management of the UI. It could be that you want to use tag functionality to specify which products a feature toggle belongs to, or to which teams.
