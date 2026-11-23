---
layout: docs
title: Accordion
description: Accordion component documentation
permalink: /docs/components/accordion/
---

# Accordion

Expandable sections for FAQs and stacked content.

## Usage

```liquid
{% raw %}{% include components/accordion.html
   id="faq"
   items=page.faq_items
%}{% endraw %}
```

Each item: `{ title, content, open }`. `content` is rendered as trusted HTML; only pass markup from templates or trusted project data.

## Example

<div class="docs-component-example">

{% include components/accordion.html id="docs-faq" items=site.data.demo.accordion_items %}

</div>

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | **Required.** Group id |
| `items` | array | `{ title, content, open }`; each `content` value is trusted HTML |
| `class` | string | Extra classes |

Add `data-accordion-multiple` on the root (via class wrapper or custom include) to allow multiple open panels. Default behavior closes other panels when one opens.

## Accessibility

- Triggers are real `<button>` elements
- `aria-expanded` and `aria-controls` link trigger ↔ panel
- Panels use `role="region"` and `aria-labelledby`
