---
layout: docs
title: Offcanvas
description: Accessible offcanvas side panel — navigation (left) or filters/settings (right)
permalink: /docs/components/offcanvas/
---

# Offcanvas

An accessible side panel that slides in from the **left** or **right**. It traps keyboard focus while open and closes with Escape, backdrop click, the close button, or when a navigation link inside the panel is activated.

## Common patterns

| Use case | Position | Typical content |
|----------|----------|-----------------|
| Docs / app navigation | `left` | Nav links, groups |
| Filters / settings | `right` | Form controls, apply/reset |
| Cart / details | `right` | Summary, actions |

## Usage

### Navigation (left)

```liquid
{% raw %}{% include components/button.html
   label="Open menu"
   variant="outline"
   offcanvas_open="site-nav"
%}

{% capture nav_content %}
  <nav aria-label="Site">
    <a href="/docs/">Documentation</a>
    <a href="/blog/">Blog</a>
  </nav>
{% endcapture %}

{% include components/offcanvas.html
   id="site-nav"
   title="Menu"
   position="left"
   content=nav_content
%}{% endraw %}
```

### Filters / settings (right)

```liquid
{% raw %}{% include components/button.html
   label="Filters"
   variant="outline"
   offcanvas_open="filters"
%}

{% capture filter_content %}
  <form>
    <label>Category
      <select name="category">
        <option>All</option>
        <option>Docs</option>
      </select>
    </label>
  </form>
{% endcapture %}

{% capture filter_footer %}
  <button type="button" data-offcanvas-close class="c-button c-button--ghost">Reset</button>
  <button type="submit" form="filters-form" class="c-button c-button--primary">Apply</button>
{% endcapture %}

{% include components/offcanvas.html
   id="filters"
   title="Filters"
   position="right"
   content=filter_content
   footer=filter_footer
%}{% endraw %}
```

The `offcanvas_open` button parameter adds the trigger attributes and keeps `aria-expanded` in sync. For a custom trigger, use `data-offcanvas-open="<id>"` on a button.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | — | **Required.** Unique panel id, matched by the trigger |
| `title` | string | — | Panel title, used by `aria-labelledby` |
| `position` | string | `right` | Panel placement: `left` or `right` |
| `content` | string | — | Panel body HTML |
| `footer` | string | — | Optional footer actions HTML |
| `class` | string | — | Extra classes on the panel |

## Auto-close on link navigation

When a user activates a link **inside** an open offcanvas:

- The panel **closes immediately** (snappy feel before the next page paints).
- Normal navigation still proceeds (no `preventDefault`).
- Focus is **not** restored to the trigger (the browser is leaving the page).

**Exceptions** (panel stays open):

| Case | Behavior |
|------|----------|
| `href="#..."` same-page hash | Stay open |
| `href="#"` or empty | Stay open |
| Link has `data-offcanvas-keep` | Stay open |

Example — keep panel open for an in-page action:

```html
<a href="#advanced-options" data-offcanvas-keep>Advanced options</a>
```

## Accessibility

- Uses `role="dialog"`, `aria-modal="true"`, and a labelled title.
- Moves focus into the panel and traps Tab navigation until the panel closes.
- Escape, the close button, backdrop click, and navigational links close the panel.
- Restores focus to the trigger (except when navigating away via a link).
- Prevents background scrolling while open.
- Respects `prefers-reduced-motion`.

## Live examples

### Right panel (filters / settings)

<div class="docs-component-example">

  {% include components/button.html label="Open filters" variant="outline" offcanvas_open="docs-offcanvas-filters" %}

  {% capture filter_body %}
    <p style="margin-bottom: var(--space-4);">Example filter panel sliding from the right.</p>
    <div class="l-stack" style="gap: var(--space-3);">
      <label class="c-label">
        Status
        <select class="c-select" name="status">
          <option>All</option>
          <option>Published</option>
          <option>Draft</option>
        </select>
      </label>
      <label class="c-label">
        Sort
        <select class="c-select" name="sort">
          <option>Newest</option>
          <option>Oldest</option>
        </select>
      </label>
    </div>
  {% endcapture %}

  {% capture filter_footer %}
    <button type="button" class="c-button c-button--ghost c-button--md" data-offcanvas-close>Reset</button>
    <button type="button" class="c-button c-button--primary c-button--md" data-offcanvas-close>Apply</button>
  {% endcapture %}

  {% include components/offcanvas.html
    id="docs-offcanvas-filters"
    title="Filters"
    position="right"
    content=filter_body
    footer=filter_footer
  %}

</div>

### Left panel (navigation)

<div class="docs-component-example">

  {% include components/button.html label="Open navigation" variant="outline" offcanvas_open="docs-offcanvas-nav" %}

  {% capture nav_body %}
    <nav aria-label="Example docs">
      <a href="{{ '/docs/' | relative_url }}" class="l-docs__nav-link">Overview</a>
      <a href="{{ '/docs/components/' | relative_url }}" class="l-docs__nav-link">Components</a>
      <a href="{{ '/docs/installation/' | relative_url }}" class="l-docs__nav-link">Installation</a>
    </nav>
    <p style="margin-top: var(--space-4); font-size: var(--font-size-sm);">
      Tapping a link closes the panel before navigation.
    </p>
  {% endcapture %}

  {% include components/offcanvas.html
    id="docs-offcanvas-nav"
    title="Navigation"
    position="left"
    content=nav_body
  %}

</div>
