# Resizable Columns Feature

This feature allows users to resize columns in the Project Feature Toggles table by dragging column boundaries.

## Enabling the Feature

The resizable columns functionality is controlled by the `resizableColumns` feature flag.

### Environment Variable

Set the environment variable to enable the feature:

```bash
export UNLEASH_EXPERIMENTAL_RESIZABLE_COLUMNS=true
```

### Unleash Feature Flag

Alternatively, you can control this feature through an Unleash feature flag named `resizableColumns`.

## Features Included

When enabled, users can:

1. **Drag column boundaries** to resize columns
2. **Double-click column boundaries** to auto-size columns
3. **See visual feedback** during resize operations
4. **Persist column sizes** per project in localStorage
5. **Reset column widths** via the columns menu

## Technical Implementation

- **Feature Flag**: `resizableColumns` (frontend/backend)
- **Storage**: LocalStorage per project (`project-feature-toggles-column-sizes:{projectId}`)
- **Components**: PaginatedTable, ProjectFeatureToggles, ResizableHeaderCell
- **Styling**: CSS-in-JS with Material-UI theming

## Resizable Columns

- Name (150px - 600px)
- Created (120px - 200px)
- Created By (80px - 150px)
- Last seen (120px - 200px)
- Lifecycle (120px - 200px)
- Environment columns (90px - 200px each)

## Non-resizable Columns

- Select checkbox (fixed 50px)
- Favorite star (fixed 60px)
- Actions menu (fixed 100px)

## Browser Support

- Modern browsers with CSS `table-layout: fixed` support
- Mouse and touch events for drag interactions
- LocalStorage for persistence