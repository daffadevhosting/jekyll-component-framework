---
layout: docs
title: Form Controls
description: Input, textarea, select, checkbox, and radio documentation
permalink: /docs/components/forms/
---

# Form Controls

Native form controls with consistent styling, labels, hints, and error states.

See the dedicated pages for [Input]({{ "/docs/components/input/" | relative_url }}), [Textarea]({{ "/docs/components/textarea/" | relative_url }}), [Select]({{ "/docs/components/select/" | relative_url }}), [Combobox]({{ "/docs/components/combobox/" | relative_url }}), [Checkbox]({{ "/docs/components/checkbox/" | relative_url }}), and [Radio]({{ "/docs/components/radio/" | relative_url }}).

## Input

```liquid
{% raw %}{% include components/input.html
   name="email"
   label="Email"
   type="email"
   placeholder="you@example.com"
   required=true
%}{% endraw %}
```

{% include components/input.html name="docs-email" label="Email" type="email" placeholder="you@example.com" required=true %}

## Textarea

```liquid
{% raw %}{% include components/textarea.html
   name="message"
   label="Message"
   rows=4
%}{% endraw %}
```

{% include components/textarea.html name="docs-message" label="Message" placeholder="Write something..." %}

## Select

```liquid
{% raw %}{% include components/select.html
   name="plan"
   label="Plan"
   placeholder="Choose a plan"
   options=site.data.demo.select_options
%}{% endraw %}
```

## Checkbox & Radio

```liquid
{% raw %}{% include components/checkbox.html name="terms" label="I agree" %}
{% include components/radio.html name="tier" value="free" label="Free" checked=true %}
{% include components/radio.html name="tier" value="pro" label="Pro" %}{% endraw %}
```

<div class="l-stack l-stack--sm u-mb-6">
{% include components/checkbox.html name="docs-terms" label="I agree to the terms" %}
{% include components/radio.html name="docs-tier" value="free" label="Free" checked=true %}
{% include components/radio.html name="docs-tier" value="pro" label="Pro" %}
</div>

## Accessibility

- Labels are associated with controls via `for` / `id`
- `required` is reflected in the label (`*`) and the control
- Errors use `aria-invalid` and `role="alert"`
- Hints are linked with `aria-describedby` when present
