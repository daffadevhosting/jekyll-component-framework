---
layout: docs
title: Combobox
description: Searchable, keyboard-accessible option picker
permalink: /docs/components/combobox/
---

# Combobox

Search and select an option from a list. Without JavaScript, the component uses a native select; with JavaScript, it enhances the select into a searchable listbox.

```liquid
{% raw %}{% include components/combobox.html
   name="plan"
   label="Plan"
   placeholder="Choose a plan"
   options=site.data.demo.select_options
   required=true
%}{% endraw %}
```

## Example

<div class="docs-component-example">

{% include components/combobox.html name="docs-combobox-plan" label="Plan" placeholder="Search plans" options=site.data.demo.select_options required=true hint="Type to filter, then choose a plan." %}

</div>

Each option has `value`, `label`, and an optional `selected` property. The `value` parameter can select an initial option by value.

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | — | Form field name |
| `id` | string | `name` | Control id and label association |
| `label` | string | — | Visible label |
| `aria_label` | string | `name` | Accessible name when no visible label is rendered |
| `placeholder` | string | — | Input placeholder and native select prompt |
| `options` | array | — | Entries with `value`, `label`, optional `selected` |
| `value` | string | — | Initially selected option value |
| `hint` | string | — | Supporting text |
| `error` | string | — | Validation message and invalid state |
| `required` / `disabled` | boolean | `false` | Control states |
| `class` | string | — | Additional classes on the wrapper |

## Keyboard and accessibility

- `ArrowDown` / `ArrowUp` move through matching options; `Home` / `End` jump to the first or last option
- `Enter` selects the active option; `Escape` closes the list and restores the current selection
- The input exposes combobox/listbox relationships and the active option through ARIA attributes
- A polite live status announces when no options match the search
- The enhanced input requires choosing a listed value; arbitrary text is rejected by native form validation
- When JavaScript is unavailable, the native select remains usable