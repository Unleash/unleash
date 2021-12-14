---
id: audit_log
title: The audit log
---

The audit log lets you track changes in Unleash. It lists _what_ changed _when_ it changed, and _who_ performed the change.

## Feature toggle log {#audit-log-per-feature-toggle}

Each feature toggle has its own audit log. The audit log is available under the "Event log" tab in the tab view.

![The event log for a feature toggle. The \"Event log\" tab is highlighted and the UI shows the most recent changes, including a JSON diff and the change details.](/img/unleash-toggle-history.png)

## Global Audit Log {#global-audit-log}

Unleash also keeps an audit log across all toggles and activation strategies, tracking all changes. You access the global audit log via the “Event history”, which you can find in the drawer menu. The global audit log is only accessible by users with instance admin access.

![The global event log and how to get there. It shows a number of events and their changes as well as the navigation steps: use the admin menu and navigate to "event history".](/img/global_audit_log.png)
