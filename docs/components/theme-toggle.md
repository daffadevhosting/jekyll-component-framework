---
layout: docs
title: Theme Toggle
description: Theme toggle component documentation
permalink: /docs/components/theme-toggle/
---

# Theme Toggle

Renders the theme switch button used by the navbar. It cycles through the supported theme preferences and stores the selection in `localStorage`.

```liquid
{% raw %}{% include components/theme-toggle.html %}{% endraw %}
```

## Example

<div class="togglr-component-example">

{% include components/theme-toggle.html %}

</div>

The `default` layout includes the toggle as part of the navbar. It can also be included separately in a custom layout. No parameters are required.

Supported preferences are `light`, `dark`, and `system`. The button has an accessible label and is enhanced by `assets/js/components/theme.js`.
