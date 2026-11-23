---
layout: docs
title: Modal
description: Modal dialog component documentation
permalink: /docs/components/modal/
---

# Modal

Accessible dialog with focus trap, Escape to close, and focus restoration.

## Usage

```liquid
{% raw %}{% include components/modal.html
   id="confirm-modal"
   title="Confirm action"
   body="Are you sure you want to continue?"
   size="md"
%}{% endraw %}
```

Trigger:

```html
{% include components/button.html label="Open" modal_open="confirm-modal" %}
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `id` | string | — | **Required.** Unique modal id |
| `title` | string | — | Dialog title |
| `body` | HTML | — | Trusted body markup |
| `content` | HTML | — | Trusted body markup alternative |
| `footer` | HTML | — | Trusted footer action markup |
| `size` | string | `md` | `sm` `md` `lg` `xl` |
| `class` | string | — | Extra classes on dialog |

## Accessibility

- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` on the title
- Focus moves into the dialog on open
- Tab cycles inside the dialog
- Escape and backdrop click close
- Focus returns to the trigger

The `body`, `content`, and `footer` slots render unescaped HTML. Only pass trusted markup from templates or trusted project data.

## Example

<div class="docs-component-example">

  {% include components/button.html label=site.data.demo.modal_example.trigger_label modal_open=site.data.demo.modal_example.id %}
  {% include components/modal.html id=site.data.demo.modal_example.id title=site.data.demo.modal_example.title body=site.data.demo.modal_example.body size=site.data.demo.modal_example.size %}

</div>
