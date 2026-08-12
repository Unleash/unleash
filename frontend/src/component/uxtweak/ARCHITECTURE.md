# UX Tweak widgets

In-app UX research widgets (currently: surveys) for the Unleash admin UI. A
researcher authors a survey in UX Tweak; UX Tweak publishes it as an Unleash
feature flag; this folder discovers that flag through the admin UI's own
frontend SDK client and renders the widget. The admin UI ships no survey
content of its own — the flag *is* the delivery channel.

## The flag contract

A survey campaign is one feature flag, named `uxtweak-survey-<page-slug>-<id>`,
carrying a `config` variant whose JSON payload is the entire survey:

```jsonc
{
  "v": 1,
  "surveyId": "sv_…",
  "page": "/projects",        // or "*" for every page
  "title": "Quick feedback",
  "intro": "…",
  "questions": [
    { "id": "q1", "type": "rating",              "prompt": "…", "required": true  },
    { "id": "q2", "type": "single", "options": ["a","b"], "prompt": "…", "required": false },
    { "id": "q3", "type": "text",                "prompt": "…", "required": false }
  ],
  "submitBase": "https://…"   // the UX Tweak server responses will be posted to
}
```

Only the name prefix is contractual — everything after `uxtweak-survey-` is
opaque. Targeting (rollout percentage, constraints) lives on the flag's
strategy and is applied by Unleash **before** the client ever sees the flag;
this folder never makes targeting decisions. It only answers one question:
does the payload's `page` fit the page the user is looking at right now?

The payload is versioned. A `v` other than `1` is rejected wholesale so a
future payload shape can never half-render on an old consumer. Parsing is
all-or-nothing for the same reason: one malformed question rejects the whole
survey, because a half-renderable survey is worse than none. Malformed input
of any kind — wrong payload type, invalid JSON, JSON that is not an object
(`"null"` parses to `null`!), missing fields — yields `null`, never a throw:
scans run inside SDK event callbacks, outside any React error boundary.

## The flow

```
ApplicationRoot
  └─ UxTweakWidgets          gate — the only piece in the main bundle
       └─ (lazy, error-isolated)
          UxTweakRunner       the widget chunk; hosts one widget per kind
            └─ useActiveSurvey()  →  UxSurveyCard
```

**`UxTweakWidgets`** — the gate. Watches the SDK client for any flag starting
with `uxtweak-` and only then lazy-loads the widget chunk. Installs without
campaigns pay one event subscription and nothing else. The subtree gets its
own silent `ErrorBoundary`: without it a widget crash would bubble to the
app-wide boundary in `ApplicationRoot` and replace the entire admin UI with
the error layout. In-app research must never be able to take the product down.

**`UxTweakRunner`** — the lazily-loaded chunk (default export for `lazy()`).
For now it is also the survey host: render the card of the survey active on
the current page. The card is keyed by `surveyId` so no component state
carries over when one campaign replaces another. When more widget kinds
arrive (chat, interviews), each gets its own host rendered here — and the
survey-specific scanning below gets generalized *then*, against real
consumers, not before.

**`survey/useActiveSurvey`** — the survey on the current page, or `null`.
Pure derivation: the SDK's `useFlags()` re-renders it whenever flags change,
`useLocation()` whenever the route changes — no subscription code of our own.
If several surveys match the same page, the first one wins.

**`survey/surveys.ts`** — the contract module: prefix constant, payload types,
the all-or-nothing parser, and `scanSurveys` (flags → prefix filter → parse →
page match).

**`survey/UxSurveyCard`** — the floating bottom-right card. Currently renders
title and intro only; closing it hides it until the next page load.

## Decisions worth knowing

- **The SDK's `useFlags()`, deliberately.** It wraps `getAllToggles()`, which
  returns only the flags already evaluated as enabled for this visitor (so no
  `enabled` re-check is needed) and, unlike `isEnabled`/`getVariant`, emits no
  impression events — discovery must not pollute analytics. It also owns the
  update-event subscription, so this folder contains no subscription code.
- **`useLocation()` for page matching, no polling.** `BrowserRouter` is
  mounted with `basename`, so the pathname already excludes the app's base
  path and compares directly against a payload's `page`. Matching is exact,
  tolerant of a trailing slash, with `*` matching everything.
- **Cloud-only in practice.** The SDK client only starts when the
  server-injected `unleashToken` meta tag is present (Unleash Cloud). On
  self-hosted installs the client is inert and this folder renders nothing.
- **MUI theme tokens throughout** — the card follows the admin UI's theme,
  including dark mode, like the other floating widgets (`FeedbackNPS`).

## Roadmap

1. ✅ Discovery + minimal card (title/intro, session-only close)
2. Question rendering (rating / single choice / free text)
3. Submission to `submitBase` + remembered answered/dismissed state + thanks
