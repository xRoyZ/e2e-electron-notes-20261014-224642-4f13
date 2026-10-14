# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Calm, productivity-first desktop UI in the spirit of Linear/Stripe: neutral grays, one indigo accent reserved for actions and the pinned marker, generous whitespace, a strict three-pane shell (list | editor | markdown preview) with a fully mirrored light and dark token set.

## Colors

- `--color-bg.light`: **#FFFFFF**
- `--color-bg-subtle.light`: **#F7F8FA**
- `--color-surface.light`: **#FFFFFF**
- `--color-surface-raised.light`: **#FFFFFF**
- `--color-code-bg.light`: **#F3F4F6**
- `--color-fg.light`: **#1A1D21**
- `--color-fg-muted.light`: **#6B7280**
- `--color-fg-subtle.light`: **#9AA1AC**
- `--color-border.light`: **#E5E7EB**
- `--color-border-strong.light`: **#D1D5DB**
- `--color-accent.light`: **#5B5BD6**
- `--color-accent-hover.light`: **#4C4CC7**
- `--color-accent-active.light`: **#4141B0**
- `--color-accent-fg.light`: **#FFFFFF**
- `--color-accent-soft.light`: **#EEEEFF**
- `--color-pin.light`: **#C2831B**
- `--color-pin-soft.light`: **#FDF3E0**
- `--color-danger.light`: **#D64545**
- `--color-danger-hover.light`: **#BF3A3A**
- `--color-danger-soft.light`: **#FDECEC**
- `--color-focus-ring.light`: **#8A8AF0**
- `--color-bg.dark`: **#16181D**
- `--color-bg-subtle.dark`: **#1D2026**
- `--color-surface.dark`: **#1D2026**
- `--color-surface-raised.dark`: **#23262E**
- `--color-code-bg.dark`: **#111318**
- `--color-fg.dark`: **#E6E8EB**
- `--color-fg-muted.dark`: **#9AA1AC**
- `--color-fg-subtle.dark`: **#6B7280**
- `--color-border.dark`: **#2A2E36**
- `--color-border-strong.dark`: **#3A404A**
- `--color-accent.dark`: **#7A7AF0**
- `--color-accent-hover.dark`: **#8E8EF5**
- `--color-accent-active.dark`: **#6464E0**
- `--color-accent-fg.dark`: **#FFFFFF**
- `--color-accent-soft.dark`: **#26264A**
- `--color-pin.dark`: **#E8B15A**
- `--color-pin-soft.dark`: **#332A16**
- `--color-danger.dark`: **#F07171**
- `--color-danger-hover.dark`: **#F58A8A**
- `--color-danger-soft.dark`: **#3A1F1F**
- `--color-focus-ring.dark`: **#8A8AF0**

## Typography

- `font_family`: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `font_family_mono`: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace
- `heading_weight`: 600
- `body_weight`: 400
- `size.display`: 20px / 28px
- `size.h1`: 18px / 26px
- `size.h2`: 16px / 24px
- `size.h3`: 14px / 20px
- `size.body`: 14px / 22px
- `size.small`: 12px / 18px
- `size.code`: 13px / 20px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-pill`: 999px

## Components

### Button (primary)

Used for 'Notiz anlegen' and Save/Done in the new-note form. Padding 8px 16px, radius md (8px), bg=accent, text=accent-fg, body_weight 500, size.body. min-height 44px, min-width 44px. States: default bg=accent; hover bg=accent-hover; active bg=accent-active + transform translateY(1px); focus-visible 2px ring focus-ring offset 2px; disabled bg=border, text=fg-subtle, opacity 1, cursor not-allowed. Icon-only variants keep a 44x44px hit area even when the glyph is 16px.

### Button (secondary / ghost)

Used for 'Abbrechen', 'Anheften', 'Löschen' in toolbars. Padding 8px 12px, radius md, bg transparent, border 1px border, text=fg, min-height 44px. Hover: bg=bg-subtle, border=border-strong. Active: bg=bg-subtle + brightness 0.97. Disabled: text=fg-subtle, border=border, cursor not-allowed. Destructive variant swaps text/border to danger, hover bg=danger-soft.

### Button (icon / pin toggle)

44x44px square, radius md, transparent bg, 16px icon. Unpinned: icon=fg-muted, hover bg=bg-subtle + icon=fg. Pinned: icon=pin, bg=pin-soft, hover slightly darker; aria-pressed reflects state. Focus-visible 2px focus-ring. Disabled state greys icon to fg-subtle.

### SearchInput

Full width of the list pane, height 40px (44px with label row), padding 8px 12px 8px 32px, radius md, bg=surface, border 1px border, text=fg, placeholder=fg-subtle. 16px search glyph at left 10px, fg-muted; clear-button (×) 32px appears only when the field is non-empty. Focus: border=accent + 1px ring focus-ring; no layout shift. Filtering starts on the first character, case-insensitive over title and body.

### NoteListItem

Row in the list pane: padding 10px 12px, radius md, min-height 56px, 1px transparent border (becomes border on selection). Line 1: title, size.body, weight 600, single-line ellipsis, color=fg. Line 2: text snippet, size.small, color=fg-muted, single-line ellipsis. Line 3: timestamp of last change, size.small, color=fg-subtle. Selected: bg=accent-soft, left accent bar 3px in accent. Hover: bg=bg-subtle. Pinned rows show a 14px pin glyph in pin color before the title and the row sits above all unpinned rows. Focus-visible ring 2px focus-ring.

### ListGroupHeader

'Angeheftet' and 'Alle Notizen' section headers: padding 12px 12px 4px, size.small, weight 600, uppercase tracking 0.04em, color=fg-subtle. A group renders only when it has items; 'Angeheftet' is hidden entirely when nothing is pinned.

### EmptyState

Shown in the list pane instead of a blank area (AC-04) and when there are no notes at all: centered, padding 32px 24px, 20px muted glyph, headline size.h3 weight 600 color=fg, one line of help text size.small color=fg-muted. Search miss: headline 'Keine Notizen gefunden', help 'Suchbegriff prüfen oder Feld leeren.' No notes at all: headline 'Noch keine Notizen', help 'Erste Notiz mit „Neue Notiz“ anlegen.'

### EditorPane

Left column of the two-column main area (Design Directive: preview to the RIGHT of the editor). Header row 56px: title input (borderless, size.h2, weight 600, bg transparent) plus Save and Delete buttons right-aligned, gap 8px. Body: borderless textarea, size.body, padding 16px, line-height 22px, bg transparent, caret=accent, resize none, fills remaining height with overflow-y auto. Error states (AC-12) only after blur or a save attempt: 1px border=danger + message size.small color=danger below the field, otherwise a neutral untouched form shows nothing.

### MarkdownPreview

Right column, 1px left border (border) separating it from the editor, bg=bg-subtle, padding 24px, overflow-y auto, max text measure 72ch, size.body, color=fg. Heading scale h1=18/600, h2=16/600, h3=14/600 with 24px top / 8px bottom margin. Lists indented 24px; blockquote gets a 3px left border in border-strong plus fg-muted text and 16px left padding. Inline code: radius sm, bg=code-bg, mono font, 1px padding. Code block: radius md, bg=code-bg, 12px padding, horizontal scroll only inside the block. Links: accent, underlined on hover. Raw HTML in the note body is rendered as escaped text (never as markup). Update is live while typing, layout must not reflow the editor column.

### ConfirmDialog

Used for the delete confirmation (AC-03). Centered modal, width 400px, radius lg, bg=surface-raised, 1px border, shadow 0 12px 32px rgba(0,0,0,0.18), padding 24px, scrim rgba(0,0,0,0.40) blur 2px. Title size.h2 weight 600; body size.body fg-muted; actions right-aligned with 8px gap: 'Abbrechen' (secondary) and 'Löschen' (destructive, autofocused last). Esc and scrim click cancel; focus is trapped while open.

### ModeToggle

Light/dark switch in the top-right of the app header: segmented control 36px tall, radius pill, bg=bg-subtle, 1px border, two 32px icon segments (sun / moon). Active segment bg=surface + subtle shadow, icon=fg; inactive icon=fg-muted, hover icon=fg. Persists immediately; on first launch the active segment reflects the system preference. Focus-visible ring 2px focus-ring.

### AppHeader

Top bar, height 56px, padding 0 16px, bg=bg, 1px bottom border. Left: product name size.h3 weight 600. Right: 'Neue Notiz' (primary) then ModeToggle, gap 8px. Every control here either performs its labeled action or is visibly disabled with a 'coming soon' tooltip — no silently dead element.

### Timestamp

Single shared date/time format for every timestamp in the product (note list rows, note header, anything else that shows a time): local time, 'TT.MM.JJJJ HH:MM' 24-hour, zero-padded, e.g. '12.06.2024 14:30'. Never relative wording ('vor 2 Stunden'), never a second format. Missing/invalid stored timestamps render as '—'. Reuse one formatter so list and header always agree.

## Layout Principles

- App shell is a full-height, non-scrolling layout: fixed 56px header on top, then a horizontal row that fills the rest. No page-level vertical or horizontal scrollbar at any desktop viewport (min window 900x600).
- Three panes in a row: list sidebar 280px fixed (min 240 / max 320), then the main area split into Editor (flex 1.1) and Markdown Preview (flex 0.9, per the binding Design Directive the preview is to the RIGHT of the editor, never below). List and preview scroll internally; the editor textarea scrolls internally.
- A 1px border (token border) separates the panes — no heavy shadows between panels; elevation is reserved for the delete modal only.
- Spacing scale is the only source of gaps: use 4/8/12/16/24/32/48px. Tight grouping inside a component (8px), 16px between related blocks, 24–32px between sections, 48px only for empty-state breathing room.
- Breakpoints: >=1440px comfortable three-pane as described; 1200–1440px keep all three panes, list narrows to 240px; 900–1200px list collapses to a 56px icon rail with the search field pinned inside the editor pane header. Below 900px is out of scope (desktop app, min window enforced).
- Both themes come from the same token names (bg / bg-subtle / surface / fg / fg-muted / border / accent / pin / danger) — components reference tokens only, never raw hex, so light and dark stay pixel-identical in structure.
- Typography scale is fixed: 20/18/16/14/12/13px. Body text 14px, never below 12px anywhere. Headings weight 600, body 400, labels 500. Mono for inline code and code blocks only.
- Focus and accessibility: every interactive element is reachable by Tab, shows a 2px focus-ring ring at 2px offset, and never relies on color alone (pinned state = pin glyph + background, error state = icon + text, not red text alone). All hit areas are at least 44x44px including icon-only buttons.
- All dates and times use exactly one format everywhere: 'TT.MM.JJJJ HH:MM' 24-hour local time (e.g. '12.06.2024 14:30'), via a single shared formatter. No relative times, no alternate format, invalid values render as '—'.
- Loading an empty or invalid note store must never leave a blank pane: every empty list or empty preview shows the EmptyState component with a headline and help line.
