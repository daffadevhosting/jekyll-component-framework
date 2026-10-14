---
layout: docs
title: Select
description: Select component documentation
permalink: /docs/components/select/
---

# Select

The select is enhanced into a themed popup when JavaScript is available. Options can include an icon, description, badge, and semantic variant. Without JavaScript it remains a native select.

```liquid
{% raw %}{% include components/select.html
   name="plan"
   label="Plan"
   placeholder="Choose a plan"
   options=site.data.demo.select_options
   required=true
%}{% endraw %}
```

## Example

<div class="docs-component-example">

{% include components/select.html name="docs-plan" label="Plan" placeholder="Choose a plan" options=site.data.demo.select_options required=true hint="You can change your plan at any time." %}

</div>

Each option has `value`, `label`, and optional `selected`, `icon`, `description`, `badge`, `badge_variant`, `variant`, or `disabled` properties. `variant` accepts `success`, `warning`, `danger`, or `info` and adds a matching accent to the popup option.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | — | Form field name |
| `id` | string | `name` | Control id and label association |
| `label` | string | — | Visible label |
| `placeholder` | string | — | Disabled empty option shown before a value is selected |
| `options` | array | — | Entries with `value`, `label`, optional `selected` |
| `value` | string | — | Selects the option whose value matches |
| `hint` | string | — | Supporting text |
| `error` | string | — | Validation message and invalid state |
| `required` / `disabled` | boolean | `false` | Native control states |
| `aria_label` | string | `name` | Accessible name when no visible label is rendered |
| `class` | string | — | Additional classes on the wrapper |

Example option data:

```yaml
- value: pro
   label: Pro
   icon: info
   description: More tools for growing teams.
   badge: Popular
   badge_variant: primary
   variant: info
```

The popup supports `ArrowUp` / `ArrowDown`, `Home` / `End`, `Enter`, `Space`, and `Escape`. Customize it independently with these tokens:

```css
:root {
   --color-select-popup: #ffffff;
   --color-select-popup-border: #d5d9df;
   --color-select-option-hover: #eef4f1;
   --color-select-option-selected: #dceae2;
   --radius-select-popup: 0.75rem;
   --shadow-select-popup: 0 8px 24px rgba(20, 30, 25, 0.12);
}
```
