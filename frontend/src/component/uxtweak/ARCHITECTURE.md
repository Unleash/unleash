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
App (logged-in branch)
  └─ UxTweakWidgets          gate — the only piece in the main bundle
       └─ (lazy, error-isolated)
          UxTweakRunner       the widget chunk; hosts one widget per kind
            └─ useActiveSurvey()  →  UxSurveyCard
```

**`UxTweakWidgets`** — the gate. Mounted in `App` next to `FeedbackNPS`,
gated on `isLoggedIn` and the internal `uxTweakSurveys` flag
(`UNLEASH_EXPERIMENTAL_UX_TWEAK_SURVEYS`, an enterprise uiConfig flag that
doubles as the kill switch) — under the SDK provider and router it reads
from, and never on the login screen. Watches the SDK client for any flag starting
with `uxtweak-` and only then lazy-loads the widget chunk. Installs without
campaigns pay one event subscription and nothing else. The gate is latched
(`useLatched`): once any `uxtweak-` flag has been present it stays mounted,
because a flag refresh that drops the last flag (rollout re-bucketing, a
paused campaign) must not unmount the runner and destroy a survey the visitor
is mid-answer in — after the flags vanish, an already-loaded chunk rendering
`null` is the whole cost. The subtree gets its
own silent `ErrorBoundary`: without it a widget crash would bubble to the
app-wide boundary in `ApplicationRoot` and replace the entire admin UI with
the error layout. In-app research must never be able to take the product down.

**`UxTweakRunner`** — the lazily-loaded chunk (default export for `lazy()`).
For now it is also the survey host: it latches the first survey
`useActiveSurvey` produces (`useLatched` again) and renders that card until
the visitor concludes it. Once shown, the card survives flag refreshes,
payload edits, and route changes — a visitor mid-answer must never have the
card yanked away (and, since the latched config keeps its object identity,
a live payload edit can no longer remount the keyed card and reset typed
answers). The latch deliberately never clears: after conclude, the card's own
state machine renders nothing, and the grace period suppresses every other
survey anyway — so a session shows at most one survey by construction. The
card stays keyed by `surveyId` so no component state carries over when one
campaign replaces another across sessions. When more widget kinds
arrive (chat, interviews), each gets its own host rendered here — and the
survey-specific scanning below gets generalized *then*, against real
consumers, not before.

**`survey/useActiveSurvey`** — the survey on the current page, or `null`.
Pure derivation: the SDK's `useFlags()` re-renders it whenever flags change,
`useLocation()` whenever the route changes — no subscription code of our own.
If several surveys match the same page, the lowest flag name wins —
`scanSurveys` sorts, because the SDK does not guarantee flag order across
refreshes and the winner must not change between page loads.

**`survey/surveys.ts`** — the contract module: prefix constant, payload types,
the all-or-nothing parser, and `scanSurveys` (flags → prefix filter → parse →
page match).

**`survey/UxSurveyCard`** — the floating bottom-right card: title, intro, the
questions as a form, and a submit button. One small component per question
type (rating → MUI `Rating`, mirroring `FeedbackComponent`; single choice →
radio group; free text → multiline `TextField`), each a controlled input over
one shared `answers` record keyed by question id. Every answer is kept as a
string — ratings included — so "answered" is one rule (non-blank after trim)
regardless of question type, and required-question gating is a single
`every()` over the questions. Submit is disabled until every required
question is answered; clicking it flips the card to a local thanks state — a
centered confirmation that fades away on its own after three seconds (the
schedule is an injectable `scheduleLeave` prop, so tests trigger the leave
directly instead of faking timers). That
state is the seam for the next slice: the submit handler is where the POST to
`submitBase` will go, and the thanks view is what the visitor sees while/after
it happens. Closing works in every state.

**A survey is shown at most once per browser.** Submitting or closing marks
the survey's id as seen (`survey/seenSurveys.ts`) in a single localStorage
entry — bare key `uxtweak-surveys-seen:v1`, a string array capped at the 50
newest ids, stored via the repo's `createLocalStorage` (auto-namespaced,
private-mode safe). `useActiveSurvey` filters seen ids out of every scan with
a fresh read, so a concluded survey stays gone across route changes and page
loads without any reactive wiring. Because every campaign has a globally
unique `surveyId`, republishing as a new campaign naturally shows again.
Known micro-edge: a flags refresh or route change landing inside the
three-second thanks window can end the thanks display a moment early —
harmless, not worth machinery.

**Concluding any survey starts a 7-day global grace period.** `markSurveySeen`
also writes a marker (`uxtweak-survey-grace:v1`) with `createLocalStorage`'s
own `timeToLive`, and `useActiveSurvey` returns `null` while the marker is
present (the storage layer deletes the expired marker on read — no hand-rolled
clock math). This is what keeps a visitor matched by several campaigns from
getting the next card the moment they finish one. Living inside
`markSurveySeen` means submit, close, and the future submission slice all
inherit it without knowing it exists.

**An ignored survey stops appearing after 3 showings.** The runner records
one impression per survey per page load (`uxtweak-survey-impressions:v1`; a
module-level set makes remounts and StrictMode double-effects free), and
`useActiveSurvey` skips any survey shown `MAX_IMPRESSIONS` times — an
ignored card must not nag forever, but one glance shouldn't burn it either.
Like all the frequency storage, malformed entries fail open: the survey
shows, never a crash.

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
2. ✅ Question rendering (rating / single choice / free text), required
   gating, thanks state with auto-dismiss, shown-at-most-once suppression
3. ✅ 7-day grace period between surveys
4. ✅ Mid-answer latch (card survives flag refreshes, payload edits, and
   route changes until concluded)
5. ✅ Impression cap (an ignored survey stops appearing after 3 showings)
6. ✅ Deterministic survey order (lowest flag name wins on every page load)
7. Further hardening: cross-tab sync
8. Submission to `submitBase`
