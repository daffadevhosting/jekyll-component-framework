---
layout: docs
title: Components
description: Explore the Thicket UI component garden
permalink: /docs/components/
---

# Components

All UI primitives ship as Liquid includes under `_includes/components/`.

## Start here

- [Button]({{ "/docs/components/button/" | relative_url }})
- [Card]({{ "/docs/components/card/" | relative_url }})
- [Form controls]({{ "/docs/components/forms/" | relative_url }})
- [Modal]({{ "/docs/components/modal/" | relative_url }})
- [Offcanvas]({{ "/docs/components/offcanvas/" | relative_url }})
- [Navbar]({{ "/docs/components/navbar/" | relative_url }})

## Full list

{% for group in site.data.navigation.docs %}
  {% if group.title == "Components" %}
    {% for item in group.items %}
      {% unless item.url == page.url %}
- [{{ item.title }}]({{ item.url | relative_url }})
      {% endunless %}
    {% endfor %}
  {% endif %}
{% endfor %}

## Usage pattern

```liquid
{% raw %}{% include components/button.html
   label="Get Started"
   href="/docs/"
   variant="primary"
%}{% endraw %}
```

Paths passed to `href` are processed with `relative_url`, so the site works with a `baseurl` (for example GitHub Pages project sites).

## New foundation component examples

These live previews show the layout primitives and icon added to the component docs.

### Container

<div class="c-card u-p-4 u-mb-4">
{% capture container_example %}<p>A centered content area with responsive side padding.</p>{% endcapture %}
{% include components/container.html size="md" content=container_example %}
</div>

```liquid
{% raw %}{% include components/container.html size="md" content=page.content %}{% endraw %}
```
<div class="u-mb-4 u-float-right">
{% include components/button.html
   label="Container API"
   href="/docs/components/container/"
   variant="outline"
   icon="arrow-right" icon_position="right"
   size="sm"
   ripple=true
%}
</div>

### Stack

<div class="c-card u-p-4 u-mb-4">
{% capture stack_example %}<div class="c-card"><div class="c-card__body">Profile details</div></div><div class="c-card"><div class="c-card__body">Notification settings</div></div><div class="c-card"><div class="c-card__body">Billing information</div></div>{% endcapture %}
{% include components/stack.html size="sm" content=stack_example %}
</div>

```liquid
{% raw %}{% include components/stack.html size="sm" content=page.content %}{% endraw %}
```
<div class="u-mb-4 u-float-right">
{% include components/button.html
   label="Stack API"
   href="/docs/components/stack/"
   variant="outline"
   icon="arrow-right" icon_position="right"
   size="sm"
   ripple=true
%}
</div>

### Grid

<div class="c-card u-p-4 u-mb-4">
{% capture grid_example %}<div class="c-card"><div class="c-card__body">Design</div></div><div class="c-card"><div class="c-card__body">Build</div></div><div class="c-card"><div class="c-card__body">Ship</div></div>{% endcapture %}
{% include components/grid.html columns="3" gap="3" content=grid_example %}
</div>

```liquid
{% raw %}{% include components/grid.html columns="3" gap="3" content=page.content %}{% endraw %}
```
<div class="u-mb-4 u-float-right">
{% include components/button.html
   label="Grid API"
   href="/docs/components/grid/"
   variant="outline"
   icon="arrow-right" icon_position="right"
   size="sm"
   ripple=true
%}
</div>

### Divider

<div class="c-card u-p-4 u-mb-4">
  <p>Account settings</p>
  {% include components/divider.html variant="subtle" %}
  <p>Privacy preferences</p>
</div>

```liquid
{% raw %}{% include components/divider.html variant="subtle" %}{% endraw %}
```
<div class="u-mb-4 u-float-right">
{% include components/button.html
   label="Divider API"
   href="/docs/components/divider/"
   variant="outline"
   icon="arrow-right" icon_position="right"
   size="sm"
   ripple=true
%}
</div>


### Icon

<div class="c-card u-p-4 u-mb-4">
  <p>{% include components/icon.html name="check-circle" size="1.25em" %} All changes saved</p>
</div>

```liquid
{% raw %}{% include components/icon.html name="check-circle" size="1.25em" %}{% endraw %}
```
<div class="u-mb-4 u-float-right">
{% include components/button.html
   label="Icon API"
   href="/docs/components/icon/"
   variant="outline"
   icon="arrow-right" icon_position="right"
   size="sm"
   ripple=true
%}
</div>
