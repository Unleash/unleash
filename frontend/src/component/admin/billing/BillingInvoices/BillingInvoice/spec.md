# Page & container

* **Canvas/background:** very light gray page (#EAEAED approx).
* **Main card:** centered, white background, full-width minus page padding, rounded corners (~12–16px), subtle shadow (1–2px blur, low opacity).
* **Outer padding:** ~24px around the card; ~16px vertical spacing between major blocks inside.

# Header row (card top bar)

* **Left:** page section title: **“October 15th”**.

  * Font: sans-serif UI (think Inter/ system).
  * Size/weight: ~20–22px, semibold.
  * Color: near-black (#202021).
* **Right:** total and controls, aligned on baseline with the title:

  * **Chip:** “Estimated”

    * Pill shape (full rounding ~9999px).
    * Height ~24px; horizontal padding ~10–12px.
    * Background: warm orange (#AD6321 to #BC8042 range). (warning)
    * Text: small/uppercase or all-caps feel (~12px, medium), light cream text (#FDF4E6).
  * **Grand total (top):** **$8,500** to the far right.

    * Size/weight: ~16px, bold/semibold; color dark gray (#4A4A4A).
  * **Caret icon:** small chevron pointing **up** (expanded state) near far/right edge with hit target ~24px square.

A thin divider isn’t drawn; the white card continues into the line-item table.

# Line-item table header

Four columns; left-aligned except Amount (right):

1. **Description** (left)
2. **Included**
3. **Quantity**
4. **Amount** (right)

* Header labels: small uppercase/medium weight (~12px), muted gray (#6E6E70).
* Column grid (desktop):

  * Description: ~40–45%
  * Included: ~20%
  * Quantity: ~15%
  * Amount: ~25% (right-aligned)
* Row height baseline: ~56–64px for the item row (before usage block).

# Line item: “Unleash PAYG Seat”

* **Description column:**

  * Primary: “**Unleash PAYG Seat**” (~14–15px, medium, #909090).
  * Secondary: “Sep 15 – Oct 15” (~12–13px, regular, #B6B6B7).
* **Included column:** empty for this item (the usage breakdown below covers entitlements).
* **Quantity:** **41** (center/left aligned to column).
* **Amount (right):** **$3,076** (right-aligned, ~14–15px, medium).

# Usage block (nested section)

A light panel under the line item spans full width of the card content.

* **Container:**

  * Background: light neutral/blue-gray (#F7F7FA).
  * Corner radius: matches card (~12px).
  * Inner padding: ~16–20px.
  * Top margin from the row above: ~12–16px.
* **Section title:** “**Usage September**”

  * Small, semibold (~13–14px), dark (#202021).

Each usage metric is a **row with 4 columns** mirroring the header: **Label | Included | Actual | Amount**.

### Metric rows (in order)

1. **Frontend traffic**

   * **Included:** `10/10M requests`

     * Preceded by a small **circular progress ring** (see component spec below) in **accent purple**.
   * **Actual:** `1,085M requests`
   * **Amount:** `$5,425`

2. **Service connections**

   * **Included:** `7/7 connections` (ring shows full/complete)
   * **Actual:** `20 connections`
   * **Amount:** `$0`

3. **Release templates**

   * **Included:** `3/5 templates` (ring partially filled)
   * **Actual:** *(empty / em dash not shown)*
   * **Amount:** `$0`

4. **Edge Frontend Traffic**

   * **Included:** `2/10M requests` (ring small partial)
   * **Actual:** *(empty)*
   * **Amount:** `$0`

5. **Edge Service Connections**

   * **Included:** `5/5 connections` (ring full)
   * **Actual:** *(empty)*
   * **Amount:** `$0`

* **Typography/colors inside usage rows:**

  * Labels (left): ~14–15px, dark (#202021).
  * Included & Actual values: ~14px, regular, dark (#202021).
  * Amounts on rows with $0: muted gray (~#818182) OR same dark but visual weight is from the value; non-zero amount ($5,425) uses dark color.
* **Row spacing:** ~12px vertical space between rows; no visible row borders.

### Circular progress ring (Included column)

* **Size:** ~18–20px outer diameter.
* **Stroke:** ~2–3px width.
* **Background track:** very light gray/lavender (#EAEAED to #F0F0F4).
* **Progress arc:** accent **purple/indigo** (appears around #6A5AE0 to #7B6EF6; treat as a single brand accent).
* **States:**

  * **Complete (7/7, 5/5, 10/10M):** arc forms a full ring; consider adding a subtle filled dot/gradient start (optional).
  * **Partial (3/5, 2/10M):** arc angle proportional to current / max.
  * **Empty:** (not shown here) would be track only.
* **Alignment:** the ring sits before the Included text with ~8px gap; ring and text are vertically centered.

# Subtotals & totals (footer of card)

* **Block container:** right side summary inside the same light usage panel’s parent (i.e., still white card).
* **Rows:**

  1. **Sub total** — value **$8,500**

     * Label: small gray (#9B9CA0 / #D5D5D5 seen on screen due to anti-aliasing), ~13–14px.
     * Value: right-aligned; medium weight; dark (#202021).
     * Divider line below (hairline, #EAEAED).
  2. **Customer tax is exempt**

     * Single line, gray text (~13px), no value column, sits aligned to the label column, no icon.
  3. **Total** — value **$8,500**

     * Label: small label “Total”.
     * Value: bold (~16px), right-aligned, dark (#202021).
* **Column behavior:** labels left, amounts right; the value column aligns with the table’s Amount column.

# Spacing & rhythm (approx)

* Title to table header: 16px.
* Table header to first row: 8–12px.
* Row vertical padding: 12–16px.
* Line item to usage panel: 12–16px.
* Inside usage panel: 14–16px around; 10–12px between rows.
* Usage panel to subtotal block: ~12–16px.
* Subtotal rows spacing: 8–12px; divider thickness 1px.

# Colors (usable palette approximations)

* **Text / primary:** #202021
* **Text / secondary:** #6E6E70, #818182, #909090, #B6B6B7
* **Background / page:** #EAEAED
* **Background / card:** #FFFFFF
* **Background / nested panel:** #F7F7FA
* **Border / hairline:** #EAEAED
* **Accent (progress rings):** purple/indigo ~#6A5AE0–#7B6EF6 (pick 1)
* **Chip (Estimated):** bg #AD6321–#BC8042 (warning), text #FDF4E6

# Alignment & responsiveness

* **Four-column grid** collapses on small screens. Suggested:

  * Tablet: Description 50%, Included 25%, Quantity 10–15%, Amount 15–20%.
  * Mobile: stack as: Description (with quantity & amount in a two-column subrow), then the usage block full-width below.
* **Amount column** is right-aligned everywhere.
* **Numbers** use thousands separators as shown: `1,085M`, currency with **$** and no decimals.
* **Date** uses en dash (–) between start and end.

# Interactions & states

* **Caret (collapse/expand):** toggles visibility of the line-item content (including the usage block and subtotal area). Rotates 180° to point down when collapsed.
* **Estimated chip:** non-interactive indicator; cursor default.
* **Usage rows:** non-interactive display; the rings are purely indicative (no hover shown).
* **Row hover (optional):** subtle background tint (#F9F9FB) or keep static.

# Accessibility

* **Color contrast:** ensure text vs. light panel meets WCAG AA (raise text color if needed).
* **Tab order:** title → chip → caret → table headers → row cells → usage rows → summary.
* **ARIA:**

  * Caret button: `aria-expanded` true/false.
  * Progress rings: use `role="img"` with `aria-label` like “3 of 5 templates”.

# Data in this example (verbatim)

* **Header:** October 15th · Chip: Estimated · Top-right total: $8,500.
* **Columns:** Description | Included | Quantity | Amount.
* **Row:** Unleash PAYG Seat · Sep 15 – Oct 15 · Quantity 41 · Amount $3,076.
* **Usage September** (rows):

  * Frontend traffic · 10/10M requests · 1,085M requests · $5,425
  * Service connections · 7/7 connections · 20 connections · $0
  * Release templates · 3/5 templates · — · $0
  * Edge Frontend Traffic · 2/10M requests · — · $0
  * Edge Service Connections · 5/5 connections · — · $0
* **Summary:** Sub total $8,500 · “Customer tax is exempt” · Total $8,500.

# Components to build

* **Card** (rounded, shadow).
* **Header bar** (title, chip, total, caret).
* **Four-column table** (responsive grid).
* **Usage panel** (light background, rounded).
* **Usage row** with **ProgressRing** + 3 texts + right amount.
* **Summary list** (two-column label/value with divider).
* **Pill/Chip** component for “Estimated”.

If you want, I can translate this into a component tree and props next.
