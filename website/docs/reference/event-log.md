---
title: The event log
---

The event log lets you track changes in Unleash. It lists _what_ changed, _when_ it changed, and _who_ performed the change.

## Feature toggle log {#event-log-per-feature-toggle}

<span id="audit-log-per-feature-toggle" data-reason="backwards-compatibility"></span>

Each feature toggle has its own event log. The event log is available under the "Event log" tab in the tab view.

![The event log for a feature toggle. The "Event log" tab is highlighted and the UI shows the most recent changes, including a JSON diff and the change details.](/img/unleash-toggle-history.png)

## Global Event Log {#global-event-log}

<span id="global-audit-log" data-reason="backwards-compatibility"></span>

Unleash also keeps an event log across all toggles and activation strategies, tracking all changes. You access the global event log via the “event log”, which you can find in the drawer menu. The global event log is only accessible by users with instance admin access.

![The global event log and how to get there. It shows a number of events and their changes as well as the navigation steps: use the admin menu and navigate to "event history".](/img/global_audit_log.png)
