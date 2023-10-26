---
title: Banners
---

:::info Availability

Banners were introduced as a beta feature in **Unleash 5.6** and are only available in Unleash Enterprise. We plan to make this feature generally available to all Enterprise users in **Unleash 5.7**.

:::

Banners allow you to configure and display internal messages that all users of your Unleash instance can see and interact with. They are displayed at the top of the Unleash UI, and can be configured to be interactive.

![Banners table](/img/banners-table.png)

A common use case could be to have some pre-configured banners that you can enable when you need to communicate something to your users. For example, you could have a banner that you enable when you're doing maintenance on your Unleash instance, and another banner that you enable when you're running a survey.

In order to create and display a banner, you can follow the [how to create and display banners](../how-to/how-to-create-and-display-banners.md) guide.

## Banner status

Banners can be enabled or disabled at any time. For more information on how to enable or disable a banner, see the section on [displaying banners](../how-to/how-to-create-and-display-banners.md#displaying-banners).

| Option      | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| **Enabled** | Whether the banner is currently displayed to all users of your Unleash instance. |

## Configuration

Banners can be configured with the following options:

| Option      | Description                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**    | The type of banner, which will control the banner's color and icon, if using the default icon.                                                             |
| **Icon**    | The icon to display on the banner. Can be the default icon for the banner type, or a [custom icon](#custom-icon). Can also be hidden by selecting "None".  |
| **Message** | The message to display on the banner. Supports [Markdown](https://www.markdownguide.org/basic-syntax/).                                                    |

### Custom icon

You can configure a banner with a custom icon by selecting "Custom" in the icon dropdown. This will reveal a text field where you can enter the name of the icon you want to use. The icon name should be a [Material Symbol](https://fonts.google.com/icons) name. For example, if you want to display the "Rocket Launch" icon, you can enter `rocket_launch` in the field.

| Option          | Description                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| **Custom icon** | The custom icon to be displayed on the banner, using [Material Symbols](https://fonts.google.com/icons). |

## Banner action

Banners can be configured with an action that will be triggered when a user clicks on the banner. The action can be configured with the following options:

| Option | Description |

### Link

### Dialog

## Sticky banner

Banners can be configured to be sticky, which means that they will be displayed at the top of the Unleash UI at all times. This is useful for banners that you want to make sure that your users see and interact with.

| Option | Description |
| --- | --- |
| **Sticky** | Whether the banner is sticky on the screen when scrolling. |
