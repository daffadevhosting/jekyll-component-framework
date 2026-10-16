# Thicket Portfolio Starter

A standalone, modular Jekyll portfolio starter powered by **Thicket UI 1.4.0**. Pages are composed from Liquid section includes, editable YAML data, and project collection entries. Thicket UI's published button, badge, and card components are included directly from `node_modules`; they are not copied or reimplemented.

## Requirements

- Ruby 3.0+ and Bundler
- Node.js 18+ and npm

## Run locally

```bash
npm install
bundle install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

Build the static site with:

```bash
npm run build
```

## Project structure

```text
portfolio-jekyll/
├── _data/                 # Profile, navigation, experience, testimonials
├── _includes/sections/     # Modular homepage sections
├── _layouts/              # Shared site and project-detail layouts
├── _projects/              # Markdown case studies; each generates a detail page
├── assets/css/site.css    # Portfolio layout and visual direction
├── index.html             # Homepage section composition
├── _config.yml            # Jekyll configuration and Thicket include path
├── Gemfile
└── package.json           # Pins thicket-ui@1.4.0
```

## Customize

1. Update the personal details, navigation, and social links in `_data/site.yml`.
2. Edit the introduction, portrait, and design principles in `_data/profile.yml`.
3. Replace the example experience and testimonials in `_data/`.
4. Edit or add Markdown files under `_projects/`. Set `featured: true` to show a project on the homepage.
5. Replace the example Unsplash images with photographs or mockups you have permission to use.
6. Adjust the color variables at the top of `assets/css/site.css`.

Homepage section order lives in `index.html`. Local sections use Jekyll's `include_relative`, leaving the standard Liquid `include` path free to resolve Thicket UI components from the installed npm package. Sections can be rearranged or removed in `index.html`. Case studies use the shared `project` layout.

## Thicket UI usage

The site pins Thicket UI to `1.4.0` and loads its compiled stylesheet from unpkg. Liquid components are resolved directly from the installed npm package using `includes_dir` in `_config.yml`. The project uses the published `button`, `badge`, and `card` includes. Its published component set does not include the shared `icon.html` partial, so this starter does not invoke components that depend on that partial.

Portfolio-specific CSS handles page layout and art direction; component markup and component styles remain Thicket UI's.

## Before publishing

Replace the sample identity, case studies, contact email, social URLs, testimonials, and remote image URLs with your own content. Review all image and font licenses and test the deployed site with your final `url` and `baseurl` settings.
