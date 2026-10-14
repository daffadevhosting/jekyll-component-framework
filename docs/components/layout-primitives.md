---
layout: docs
title: Layout Primitives
description: Container, stack, grid, divider, and icon component documentation
permalink: /docs/components/layout-primitives/
---

# Layout Primitives

Reusable layout and icon components built on the framework's design tokens.

## Container

Constrains content to a responsive maximum width with built-in horizontal padding.

```liquid
{% raw %}{% include components/container.html size="lg" content=page.content %}{% endraw %}
```

Available sizes: `sm`, `md`, `lg`, `xl` (default), `2xl`, and `full`.

{% include components/container.html size="sm" content="Container example" %}

## Stack

Arranges its content vertically with a consistent gap.

```liquid
{% raw %}{% include components/stack.html size="lg" content=page.content %}{% endraw %}
```

Available sizes: `xs`, `sm`, `md` (default), `lg`, `xl`, and `2xl`.

{% include components/stack.html size="sm" content="Stack example" %}

## Grid

Creates a responsive grid. Two columns start at the medium breakpoint; three- and four-column layouts expand at their configured breakpoints.

```liquid
{% raw %}{% include components/grid.html columns=3 gap=4 content=page.content %}{% endraw %}
```

`columns` accepts `2`, `3`, or `4`. `gap` accepts spacing steps `1`, `2`, `3`, `4`, `6`, or `8`.

{% include components/grid.html columns=2 gap=4 content="Grid example" %}

## Utility Classes

Use `u-*` classes for one-off layout and styling adjustments, and keep Liquid components for reusable interface patterns. Utilities use the shared design tokens, including in dark mode.

```html
<section class="u-grid u-grid-cols-1 u-md-grid-cols-3 u-gap-4 u-lg-gap-8">
	<article class="u-p-4 u-bg-surface u-text-default">
		<h2 class="u-font-display u-text-2xl u-leading-tight">A token-based utility</h2>
		<p class="u-mt-2 u-text-muted">Spacing, type, and color stay on the design system scale.</p>
	</article>
</section>
```

Spacing supports `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`, `p`, `px`, `py`, `pt`, `pr`, `pb`, and `pl`, with steps `0`, `1`-`6`, `8`, `10`, `12`, `16`, `20`, and `24`. Grid utilities provide `u-grid-cols-1` through `u-grid-cols-12`, matching `u-col-span-*` classes, and `u-gap-*`, `u-gap-x-*`, and `u-gap-y-*` on the same spacing scale.

Typography includes `u-font-sans`, `u-font-display`, `u-font-mono`, `u-text-*` sizes from `xs` through `6xl`, `u-font-*` weights, `u-leading-*`, and text alignment utilities. Text, background, and border color classes map to semantic theme tokens such as `u-text-primary`, `u-bg-success-subtle`, and `u-border-strong`.

Interaction utilities include `u-hover-bg-*`, `u-hover-text-*`, `u-focus-visible-ring`, and `u-disabled-*`. Use `u-dark-text-*`, `u-dark-bg-*`, and `u-dark-border-*` for values that should differ only in dark mode; they respond to both `data-theme="dark"` and the system dark preference.

```html
<button class="u-bg-primary u-hover-bg-primary u-focus-visible-ring">Save</button>
<section class="u-bg-background u-dark-bg-surface">The surface changes in dark mode.</section>
```

Responsive variants are mobile-first and available at `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), and `2xl` (1536px). Prefix supported display, flex, grid-column, spacing, gap, font-size, and text-alignment utilities with the breakpoint, for example `u-md-hidden`, `u-lg-px-8`, or `u-xl-text-3xl`.

## Divider

Renders a semantic horizontal rule using the framework's border tokens.

```liquid
{% raw %}{% include components/divider.html variant="subtle" %}{% endraw %}
```

Available variants: default, `subtle`, and `strong`.

{% include components/divider.html variant="subtle" %}

## Icon

Wraps the shared inline SVG include with the standard `c-icon` class.

```liquid
{% raw %}{% include components/icon.html name="arrow-right" size="1.25em" %}{% endraw %}
```

Use a supported icon name from `_includes/icon.html`. Icons are decorative and hidden from assistive technology by default.

{% include components/icon.html name="arrow-right" %}
